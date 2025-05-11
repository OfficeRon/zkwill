import express from "express";
import fs from "fs";
import crypto from "crypto";
import { buildMimcSponge } from 'circomlibjs';
import { ethers } from 'ethers';
import * as snarkjs from "snarkjs";
import { generateCommitment, calculateMerkleRootAndPath } from "./functions.js";
// Configuration
const RPC_URL = "https://testnet.sapphire.oasis.io";
const zkContractAddress = "0xBd2c938B9F6Bfc1A66368D08CB44dC3EB2aE27bE";

const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const zkWillJson = JSON.parse(fs.readFileSync("./server/rofl.json", 'utf8'));
const zkWill = new ethers.Contract(zkContractAddress, zkWillJson.abi, provider);

// Endpoint 1: Generate and insert commitment
app.post('/generateAndInsertCommitment', async (req, res) => {
    console.log("Generating and inserting commitment");
  try {
    const { redditUser, timestamp } = req.body;
    console.log(redditUser, timestamp);
    if (!redditUser || !timestamp) {
      return res.status(400).json({ error: "redditUser and timestamp are required" });
    }
        
    // Generate commitments
    const commitment1 = await generateCommitment(1, null);
    const commitment2 = await generateCommitment(0, commitment1.nullifier);
    
    const commitment1c = ethers.hexlify(
      ethers.zeroPadValue(
        ethers.toBeHex(BigInt(commitment1.commitment)), 
        32
      )
    );

    const commitment2c = ethers.hexlify(
      ethers.zeroPadValue(
        ethers.toBeHex(BigInt(commitment2.commitment)), 
        32
      )
    );
    console.log("timestamp: ", timestamp)
    console.log("now: ", Math.floor(Date.now()))
    const nullifierHash = commitment1.nullifierHash;
    console.log("nullifier hash: ", nullifierHash)  
    // Instead of sending transaction, prepare the transaction data
    const createWillCalldata = zkWill.interface.encodeFunctionData("createWill", [
      nullifierHash, 
      redditUser, 
      commitment1c, 
      commitment2c, 
      timestamp
    ]);
    
    // Prepare response
    const preimages = {
      owner: commitment1,
      heir: commitment2,
      transaction: {
        to: zkContractAddress,
        data: createWillCalldata,
        value: "1000001" // Send required value as defined in contract
      }
    };
    
    return res.json(preimages);
  } catch (error) {
    console.error("Error generating commitment:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: Generate and submit proof
app.post('/generateProof', async (req, res) => {
  try {
    const { preimage } = req.body;
    
    if (!preimage) {
      return res.status(400).json({ error: "preimage is required" });
    }
    
    // Generate inputs
    const inputs = await generateWillVerifierInputs(preimage, zkWill);
    
    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      "will_verifier.wasm",
      "circuit_0000.zkey"
    );
    
    // Format the proof for the Solidity contract
    const solidityProof = [
      proof.pi_a.slice(0, 2),  // a
      [                         // b
        proof.pi_b[0].slice(0, 2).reverse(),
        proof.pi_b[1].slice(0, 2).reverse()
      ],
      proof.pi_c.slice(0, 2)   // c
    ];
    
    // Format public inputs
    const solidityPublicInputs = [
      publicSignals[0], // nullifier
      publicSignals[1], // root
      publicSignals[2]  // timestamp
    ];
    
    // Check expiry date
    const timeNow = Math.floor(Date.now() / 1000);
    const expireDate = BigInt(await zkWill.getExpiryDate(publicSignals[0])) / BigInt(1000);
    console.log("expire date: ", expireDate, "time now: ", timeNow, "public signals: ", publicSignals[2], "nullifier: ", publicSignals[0])

    if (expireDate < timeNow || publicSignals[2] === "1") {
      // Instead of submitting proof, prepare transaction data
      const withdrawWillCalldata = zkWill.interface.encodeFunctionData("withdrawWill", [
        solidityProof[0],
        solidityProof[1],
        solidityProof[2],
        solidityPublicInputs
      ]);
      return res.json({
        success: true,
        transaction: {
          to: zkContractAddress,
          data: withdrawWillCalldata,
          value: "0" // No value needed for this transaction
        }
      });
    } else {
      // Convert BigInt to regular number for Date object
      // Ensure we're using milliseconds (divide by 1000 if in microseconds or nanoseconds)
      // Remove 'n' suffix and ensure it's within JavaScript Date range
      const formattedExpiry = typeof expireDate === 'bigint' ? 
        Number(expireDate.toString().slice(0, 13)) : 
        Number(String(expireDate).replace('n', '').slice(0, 13));
        
      return res.json({
        success: false,
        error: "Not yet expired",
        expiryDate: new Date(formattedExpiry * 1000).toLocaleString(),
        rawExpiryDate: expireDate.toString() // Include raw value for debugging
      });
    }
  } catch (error) {
    console.error("Error generating or submitting proof:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Helper function to generate inputs for the circuit
async function generateWillVerifierInputs(preimageData, zkContract) {
  const { nullifier, secret, inputTimestamp, commitment } = preimageData;
  
  const currentBlock = await provider.getBlockNumber();
  console.log("current block: ", currentBlock)
  let treeElements = [];
  for(let i = 1; i < 11; i++) {
    const events = await zkContract.queryFilter(zkContract.filters.Commit(), currentBlock - (1000 - 100 * (i - 1)), currentBlock - (1000 - 100 * i));
    console.log(i, "checking between: ", currentBlock - (1000 - 100 * (i - 1)), currentBlock - (1000 - 100 * i), events.length)
    if(events.length === 0) {
      continue;
    }
    for (let event of events) {
        treeElements.push(BigInt(event.args.commitment));
      }
  }
  

  if(treeElements.length === 0) {
    throw new Error("No commitments found");
  }
  
  const mimc = await buildMimcSponge();
  const { root, pathElements, pathIndices } = calculateMerkleRootAndPath(
    mimc,
    20,
    treeElements,
    commitment
  );
  
  // Compile all inputs
  const inputs = {
    nullifier,
    secret,
    inputTimestamp,
    pathElements,
    pathIndices
  };
  
  return inputs;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});