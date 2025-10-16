# Queue Contract Deployment Guide

## Prerequisites

- Rust toolchain installed
- Stellar CLI v23+ installed
- Testnet account with XLM

## Build

```bash
cd /home/lkilic/StellarChallenge/contract/queue-contract
stellar contract build
```

Output: `target/wasm32v1-none/release/hello_world.wasm`

## Test Locally

```bash
cargo test
```

## Deploy to Testnet

### 1. Setup Network

```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 2. Create Identity

```bash
stellar keys generate alice --network testnet
stellar keys address alice
```

### 3. Fund Account

```bash
# Replace with your address from step 2
curl "https://friendbot.stellar.org/?addr=YOUR_ADDRESS"
```

### 4. Deploy Contract

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias queue_contract
```

Save the returned contract ID!

### 5. Initialize Contract

```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- init_queue \
  --admin $(stellar keys address alice)
```

## Test on Testnet

### Join Queue

```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- join_queue \
  --user $(stellar keys address alice)
```

### List for Sale

```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- list_for_sale \
  --token_id 0 \
  --price 50000000
```

### Check Owner

```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- owner_of \
  --token_id 0
```

## Current Deployment

- **Contract ID**: `CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE`
- **Network**: Testnet
- **Admin**: `GCNLH47UZNAHQYBGSHF66HOAF23ZCPP6ULZJN3BKT6YLTMJJWCNYLE3Q`
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE

## Troubleshooting

### Error: "Contract already initialized"
The contract can only be initialized once. If you need to reinitialize, deploy a new contract.

### Error: "Authorization failed"
Make sure you're using the correct source account that owns the token.

### Build Warnings
Deprecation warnings about events are expected and don't affect functionality.

