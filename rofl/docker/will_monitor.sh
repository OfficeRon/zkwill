#!/bin/sh

# Function to check Reddit activity
check_reddit_activity() {
  local username="$1"
  local days="$2"

  echo "Checking Reddit activity for: $username in the last $days day(s)..."

  # Calculate cutoff timestamp (Unix epoch) for comparison
  local cutoff_ts=$(date -d "-${days} days" +%s)

  # Fetch user comment history (up to 25 items)
  local comments=$(curl -s "https://www.reddit.com/user/${username}/comments.json" \
    -A "activity-checker-script" | jq -r '.data.children[].data.created_utc')

  if [ -z "$comments" ]; then
    echo "No comments found or user does not exist."
    return 1
  fi

  for ts in $comments; do
    if [ "$ts" -ge "$cutoff_ts" ]; then
      echo "active"
      return 0
    fi
  done

  echo "inactive"
  return 0
}


# Function to properly decode contract response
decode_contract_response() {
  local response="$1"
  
  # Extract the result field which contains the ABI-encoded response
  local result=$(echo "$response" | jq -r '.result')
  
  # For complex data like arrays of structs, we need to properly parse the ABI encoding
  # Here we use a simple node script to decode the data
  local decoded=$(node -e "
    try {
      // Basic ABI decoding for the getAllWillsWithHashes response
      // This should match the format returned by the contract
      const hexData = '$result';
      
      // Skip the '0x' prefix if present
      const data = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
      
      // First 64 chars (32 bytes) represent the offset to the dynamic array
      const offset = parseInt(data.slice(0, 64), 16) * 2; // Convert bytes to hex chars
      
      // Next 64 chars after the offset represent the array length
      const arrayStart = offset;
      const arrayLength = parseInt(data.slice(arrayStart, arrayStart + 64), 16);
      
      const wills = [];
      
      // Each will entry has 3 fields: nullifierHash, socialHandle, expireDate
      let currentPos = arrayStart + 64; // Start after array length
      
      for (let i = 0; i < arrayLength; i++) {
        // First field is fixed-size (nullifierHash)
        const nullifierHash = '0x' + data.slice(currentPos, currentPos + 64);
        currentPos += 64;
        
        // socialHandle is a string (dynamic type)
        // Read the offset to the string data relative to the start of this struct
        const socialHandleOffset = parseInt(data.slice(currentPos, currentPos + 64), 16) * 2;
        currentPos += 64;
        
        // Get the expireDate timestamp
        const expireDate = parseInt(data.slice(currentPos, currentPos + 64), 16);
        currentPos += 64;
        
        // Jump to the string data using the offset (relative to struct start)
        const structStartPos = arrayStart + 64 + (i * 192); // 64 for array length + i * 3 fields (64 bytes each)
        const stringPos = structStartPos + socialHandleOffset;
        
        // Read string length
        const stringLength = parseInt(data.slice(stringPos, stringPos + 64), 16) * 2;
        
        // Read the actual string data and convert from hex to ASCII
        const stringHex = data.slice(stringPos + 64, stringPos + 64 + stringLength);
        let socialHandle = '';
        for (let j = 0; j < stringHex.length; j += 2) {
          socialHandle += String.fromCharCode(parseInt(stringHex.substr(j, 2), 16));
        }
        
        wills.push({
          nullifierHash,
          socialHandle,
          expireDate
        });
      }
      
      console.log(JSON.stringify(wills));
    } catch (error) {
      console.error('Error decoding contract response:', error.message);
      process.exit(1);
    }
  ")
  
  echo "$decoded"
}

# Function to convert block count to days
blocks_to_days() {
  local blocks="$1"
  # Assuming 6 second block time on average
  echo $(awk "BEGIN {print $blocks * 6 / 86400}")
}

# Main function to monitor wills
monitor_wills() {
  echo "Checking for inactive wills..."

  # Get current block height
  current_block=$(curl -s --unix-socket /run/rofl-appd.sock \
    http://localhost/rofl/v1/block/latest | jq '.block.height')
  
  echo "Current block height: $current_block"
  
  # Get current timestamp
  current_timestamp=$(date +%s)
  echo "Current timestamp: $current_timestamp"
  
  # Calculate timestamp for 24 hours in the future
  next_day_timestamp=$((current_timestamp + 86400))
  echo "Timestamp for 24 hours from now: $next_day_timestamp"
  
  # Call updateRoflTimestamp function
  echo "Updating ROFL timestamp..."
  method="9de89f37" # Keccak4("updateRoflTimestamp()")
  data="${method}"
  
  rofl_timestamp_response=$(curl -s \
    --json '{"tx": {"kind": "eth", "data": {"gas_limit": 100000, "to": "'${CONTRACT_ADDRESS}'", "value": 0, "data": "'${data}'"}}}' \
    --unix-socket /run/rofl-appd.sock \
    http://localhost/rofl/v1/tx/sign-submit)
  
  tx_hash=$(echo "$rofl_timestamp_response" | jq -r '.result')
  echo "updateRoflTimestamp transaction submitted with hash: $tx_hash"
  
  # Call updateCheckTimestamp function
  echo "Updating check timestamp..."
  method="30d9241d" # Keccak4("updateCheckTimestamp()")
  data="${method}"
  
  check_timestamp_response=$(curl -s \
    --json '{"tx": {"kind": "eth", "data": {"gas_limit": 100000, "to": "'${CONTRACT_ADDRESS}'", "value": 0, "data": "'${data}'"}}}' \
    --unix-socket /run/rofl-appd.sock \
    http://localhost/rofl/v1/tx/sign-submit)
  
  tx_hash=$(echo "$check_timestamp_response" | jq -r '.result')
  echo "updateCheckTimestamp transaction submitted with hash: $tx_hash"
  
  # Form the calldata to call getAllWillsWithHashes() method
  method="ef19a643" # Keccak4("getAllWillsWithHashes()")
  data="${method}"
  
  # Call the contract to get all wills
  wills_response=$(curl -s \
    --json '{"tx": {"kind": "eth", "data": {"to": "'${CONTRACT_ADDRESS}'", "data": "'${data}'"}}}' \
    --unix-socket /run/rofl-appd.sock \
    http://localhost/rofl/v1/tx/call)
  
  # Decode the response
  wills_data=$(decode_contract_response "$wills_response")
  echo "Found $(echo "$wills_data" | jq length) wills to process"
  
  # Process each will
  echo "$wills_data" | jq -c '.[]' | while read -r will; do
    # Extract will data
    nullifier_hash=$(echo "$will" | jq -r '.nullifierHash')
    social_handle=$(echo "$will" | jq -r '.socialHandle')
    expire_date=$(echo "$will" | jq -r '.expireDate')
    
    echo "Processing will with nullifier hash: $nullifier_hash"
    echo "Expire date: $(date -d @$expire_date)"
    
    # Check if the will is expiring in the next 24 hours
    if [ "$expire_date" -le "$next_day_timestamp" ] && [ "$expire_date" -gt "$current_timestamp" ]; then
      echo "Will is expiring in the next 24 hours. Checking activity for $social_handle"
      
      # Check Reddit activity in the last day
      activity_status=$(check_reddit_activity "$social_handle" 1)
      
      if [ "$activity_status" = "inactive" ]; then
        echo "No recent activity detected for $social_handle. No action taken, letting the will expire."
      else
        echo "User $social_handle is still active. Updating expire date."
        
        # Prepare the function call to updateExpireDate(uint256)
        method="d66f3813" # Keccak4("updateExpireDate(uint256)")
        
        # Remove '0x' prefix if present
        clean_hash="${nullifier_hash#0x}"
        # Pad to 64 characters if needed
        while [ ${#clean_hash} -lt 64 ]; do
          clean_hash="0$clean_hash"
        done
        
        data="${method}${clean_hash}"
        
        # Submit transaction to update expire date
        echo "Calling updateExpireDate for nullifier hash: $nullifier_hash"
        tx_response=$(curl -s \
          --json '{"tx": {"kind": "eth", "data": {"gas_limit": 200000, "to": "'${CONTRACT_ADDRESS}'", "value": 0, "data": "'${data}'"}}}' \
          --unix-socket /run/rofl-appd.sock \
          http://localhost/rofl/v1/tx/sign-submit)
        
        tx_hash=$(echo "$tx_response" | jq -r '.result')
        echo "Transaction submitted with hash: $tx_hash"
      fi
    else
      if [ "$expire_date" -le "$current_timestamp" ]; then
        echo "Will with nullifier hash $nullifier_hash has already expired"
      else
        echo "Will with nullifier hash $nullifier_hash is not expiring soon (expires in $((($expire_date - $current_timestamp) / 86400)) days)"
      fi
    fi
  done
}

# Main loop
while true; do
    monitor_wills
  
  check_timestamp_response=$(curl -s \
    --json '{"tx": {"kind": "eth", "data": {"gas_limit": 100000, "to": "'${CONTRACT_ADDRESS}'", "value": 0, "data": "'${data}'"}}}' \
    --unix-socket /run/rofl-appd.sock \
    http://localhost/rofl/v1/tx/sign-submit)
  
  tx_hash=$(echo "$check_timestamp_response" | jq -r '.result')
  echo "updateCheckTimestamp transaction submitted with hash: $tx_hash"
  
  # Sleep for the specified interval (default: 1 day = 86400 seconds)
  echo "Will monitor completed cycle. Sleeping for ${CHECK_INTERVAL_SECONDS} seconds..."
  sleep "${CHECK_INTERVAL_SECONDS}"
done 