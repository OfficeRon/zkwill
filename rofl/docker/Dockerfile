FROM alpine:latest

RUN apk add --no-cache curl jq openssl nodejs npm

# Install packages for Ethereum interactions
RUN npm install -g ethers web3

# Copy scripts
COPY will_monitor.sh /app/will_monitor.sh

# Make scripts executable
RUN chmod +x /app/will_monitor.sh

# Environment variables will be provided at runtime
ENV CONTRACT_ADDRESS="0x0d8cc4b8d15D4c3eF1d70af0071376fb26B5669b"
ENV CHECK_INTERVAL_SECONDS="60"

WORKDIR /app

CMD ["/bin/sh", "-c", "./will_monitor.sh & wait"]
