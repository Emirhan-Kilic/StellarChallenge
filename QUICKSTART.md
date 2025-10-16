# 🚀 StellarSkip - Quick Start Guide

This guide will get you up and running with the StellarSkip MVP in minutes.

## ✅ Prerequisites Checklist

- [ ] [Freighter Wallet](https://freighter.app) installed in your browser
- [ ] Node.js v18+ installed
- [ ] Rust and Cargo installed (for contract development)
- [ ] Stellar CLI v23+ installed

## 🎯 Quick Setup (Frontend Only)

If you just want to use the already-deployed contract:

```bash
# 1. Navigate to frontend directory
cd /home/lkilic/StellarChallenge/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🔧 Full Setup (Contract + Frontend)

### Step 1: Smart Contract

The contract is already deployed to Testnet:
- **Contract ID**: `CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE`
- **Network**: Stellar Testnet

To deploy your own:

```bash
cd /home/lkilic/StellarChallenge/contract/queue-contract

# Build contract
stellar contract build

# Setup Stellar CLI
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Create identity
stellar keys generate alice --network testnet

# Fund it
curl "https://friendbot.stellar.org/?addr=$(stellar keys address alice)"

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias queue_contract

# Initialize (save the contract ID from previous step)
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- init_queue \
  --admin $(stellar keys address alice)
```

### Step 2: Update Frontend

If you deployed a new contract, update the contract ID:

```bash
# Edit frontend/lib/stellar.ts
# Change: export const CONTRACT_ID = "YOUR_NEW_CONTRACT_ID";
```

### Step 3: Run Frontend

```bash
cd /home/lkilic/StellarChallenge/frontend
npm install
npm run dev
```

## 🎮 Using the Application

### First Time Setup

1. **Install Freighter Wallet**
   - Go to [freighter.app](https://freighter.app)
   - Add to your browser
   - Create a new wallet or import existing

2. **Switch to Testnet**
   - Open Freighter settings
   - Switch network to "Testnet"

3. **Get Testnet XLM**
   - Copy your Freighter address
   - Visit: `https://friendbot.stellar.org/?addr=YOUR_ADDRESS`

### Using StellarSkip

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve in Freighter

2. **Join Queue**
   - Click "🎫 Join Queue"
   - Approve transaction
   - You'll receive token #0 (first in queue!)

3. **List for Sale**
   - Go to "My Token" tab
   - Enter price in XLM (e.g., 5)
   - Click "List"
   - Approve transaction

4. **Buy a Token** (use different wallet)
   - Switch to another Freighter account
   - Go to "Queue List" tab
   - Click "Buy" on any listed token
   - Approve transaction with XLM payment

5. **Verify Ownership**
   - Go to "Verifier" tab
   - Enter token ID or scan QR code
   - See current owner address

## 🧪 Testing the Full Flow

### Two-User Test

**Terminal 1 - User Alice:**
```bash
# Alice joins queue
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- join_queue \
  --user $(stellar keys address alice)
# Returns: 0 (token ID)

# Alice lists for sale
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- list_for_sale \
  --token_id 0 \
  --price 50000000
# Price: 5 XLM (50000000 stroops)
```

**Terminal 2 - User Bob:**
```bash
# First, generate Bob
stellar keys generate bob --network testnet

# Fund Bob
curl "https://friendbot.stellar.org/?addr=$(stellar keys address bob)"

# Get native XLM token address
# For Testnet: CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA

# Bob buys Alice's token
stellar contract invoke \
  --id queue_contract \
  --source bob \
  --network testnet \
  -- buy_token \
  --token_id 0 \
  --buyer $(stellar keys address bob) \
  --xlm_token CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA
```

**Verify:**
```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- owner_of \
  --token_id 0
# Should return Bob's address!
```

## 🐛 Troubleshooting

### "Freighter Wallet Not Installed"
- Install Freighter browser extension
- Refresh the page

### "Insufficient XLM balance"
- Get more testnet XLM from friendbot
- Ensure you're on Testnet (not Mainnet!)

### "Transaction failed"
- Check you're on the correct network (Testnet)
- Ensure you have enough XLM for fees
- Verify you own the token you're trying to list/sell

### "Failed to sign transaction"
- Make sure you approved the transaction in Freighter
- Check Freighter is unlocked

## 📊 Current Deployment Status

- ✅ Smart Contract: Deployed on Testnet
- ✅ Frontend: Ready to run
- ✅ Tests: Passing
- ✅ Documentation: Complete

## 🔗 Useful Links

- **Frontend**: http://localhost:3000
- **Contract Explorer**: https://stellar.expert/explorer/testnet/contract/CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE
- **Freighter**: https://freighter.app
- **Stellar Docs**: https://developers.stellar.org/

## 📞 Support

For detailed documentation, see:
- Main README: `/home/lkilic/StellarChallenge/README.md`
- Contract Deployment: `/home/lkilic/StellarChallenge/contract/DEPLOYMENT.md`
- Frontend README: `/home/lkilic/StellarChallenge/frontend/README.md`

---

**Ready to skip the queue? Let's go! 🚀**

