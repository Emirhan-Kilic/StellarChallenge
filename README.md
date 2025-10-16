# StellarSkip - A Real-Time Market for Queue Spots

> A decentralized marketplace for physical queue spots on Stellar Testnet, where each user receives a tradable NFT representing their position in line.

![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![Soroban](https://img.shields.io/badge/Soroban-Smart_Contracts-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

## 🚀 Project Overview

StellarSkip demonstrates a fully functional MVP for a hackathon that proves the core **"Mint → Trade → Verify"** loop:

- Users connect their Stellar wallet via **Freighter**
- A **Soroban smart contract** manages queue positions as tradable NFTs
- The frontend displays a live queue with buy/sell functionality
- QR codes enable physical verification of token ownership

## 📋 Features

✅ **Wallet Integration**: Connect/disconnect via Freighter Wallet
✅ **Join Queue**: Mint a sequential NFT representing your queue position  
✅ **List for Sale**: Set a price in XLM for your queue spot  
✅ **Buy Token**: Atomic swap of XLM for NFT between users  
✅ **QR Verification**: Scan QR codes to verify token ownership on-site  
✅ **Live Updates**: Refresh to see real-time queue changes

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS | Dashboard & UI |
| **Contract** | Rust + Soroban SDK | Queue logic & atomic swaps |
| **Wallet** | Freighter API | Connection & signing |
| **Network** | Stellar Testnet | Development & demo |

## 📁 Project Structure

```
/home/lkilic/StellarChallenge/
├── contract/
│   └── queue-contract/
│       ├── contracts/hello-world/
│       │   ├── src/
│       │   │   ├── lib.rs          # Smart contract implementation
│       │   │   └── test.rs         # Unit tests
│       │   └── Cargo.toml
│       └── Cargo.toml
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── WalletConnect.tsx       # Wallet connection UI
│   │   ├── QueueList.tsx           # Live queue display
│   │   ├── MyToken.tsx             # User's token & QR code
│   │   └── Verifier.tsx            # QR scanner for verification
│   ├── lib/
│   │   ├── freighter.ts            # Wallet integration
│   │   └── stellar.ts              # Contract interaction
│   └── package.json
└── README.md
```

## 🔧 Prerequisites

Before you begin, ensure you have:

- [Rust](https://rustup.rs/) (latest stable)
- [Stellar CLI](https://developers.stellar.org/docs/smart-contracts/getting-started/setup) v23+
- [Node.js](https://nodejs.org/) v18+ and npm
- [Freighter Wallet](https://freighter.app) browser extension

## 🏗 Setup Instructions

### 1. Smart Contract Setup

```bash
cd /home/lkilic/StellarChallenge/contract/queue-contract

# Build the contract
stellar contract build

# The WASM output will be at:
# target/wasm32v1-none/release/hello_world.wasm
```

### 2. Deploy to Testnet

```bash
# Configure Stellar CLI for Testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Create and fund an identity
stellar keys generate alice --network testnet

# Get the address
stellar keys address alice

# Fund it with testnet XLM (replace with your address)
curl "https://friendbot.stellar.org/?addr=YOUR_ADDRESS"

# Deploy the contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias queue_contract

# Initialize the contract (replace ADMIN_ADDRESS)
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- init_queue \
  --admin ADMIN_ADDRESS
```

**Contract ID (Current Deployment):**
```
CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE
```

### 3. Frontend Setup

```bash
cd /home/lkilic/StellarChallenge/frontend

# Install dependencies
npm install

# Update the contract ID in lib/stellar.ts if you deployed a new contract
# export const CONTRACT_ID = "YOUR_CONTRACT_ID";

# Build the frontend
npm run build

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🎯 Usage Guide

### For Queue Participants

1. **Install Freighter Wallet** (if not already installed)
2. **Connect Wallet** using the "Connect Wallet" button
3. **Join Queue** by clicking "🎫 Join Queue"
   - You'll receive an NFT with a unique token ID
4. **View Your Token** in the "My Token" tab
   - See your QR code for verification
   - List your token for sale with a price in XLM
5. **Buy Tokens** from the "Queue List" tab
   - Browse available positions
   - Click "Buy" on any listed token
   - Approve the transaction in Freighter

### For Verifiers (e.g., Barista)

1. Open the app and go to the "Verifier" tab
2. **Scan QR Code** from customer's phone
   - Grant camera permissions when prompted
3. **Verify Ownership**
   - See the token ID and current owner address
   - Confirm it matches the customer

## 🧪 Testing the Full Flow

### End-to-End Test

1. **User 1**: Connect wallet → Join queue → Receive token #0
2. **User 1**: List token #0 for 5 XLM
3. **User 2**: Connect different wallet → Buy token #0
4. **Atomic Swap**: XLM transfers to User 1, NFT ownership transfers to User 2
5. **Verification**: User 2 shows QR code → Verifier scans → Confirms User 2 owns token #0

## 📜 Smart Contract Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `init_queue` | `admin: Address` | Initialize contract with admin |
| `join_queue` | `user: Address` | Mint next sequential NFT to user |
| `list_for_sale` | `token_id: u32, price: u128` | List token for sale |
| `buy_token` | `token_id: u32, buyer: Address, xlm_token: Address` | **Atomic swap** of XLM for NFT |
| `owner_of` | `token_id: u32` | Get current owner (for verification) |
| `get_price` | `token_id: u32` | Get token price (0 if not for sale) |
| `get_next_token_id` | - | Get total tokens minted |

## 🔐 Security Notes

- All transactions require user signature via Freighter
- Atomic swaps ensure either both transfers succeed or both fail
- Token ownership is verified on-chain via `owner_of`
- QR codes contain only the token ID (public information)

## 🌐 Network Information

- **Network**: Stellar Testnet
- **RPC URL**: https://soroban-testnet.stellar.org:443
- **Network Passphrase**: `Test SDF Network ; September 2015`
- **Explorer**: [Stellar Expert](https://stellar.expert/explorer/testnet)

## 📝 Known Limitations (MVP Scope)

- Single queue only (no multiple queues)
- No notifications for sales
- No admin controls or queue pausing
- No geo-fencing or real-world constraints
- Manual refresh required for queue updates

## 🔗 Useful Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Freighter Wallet](https://freighter.app/)
- [Contract Explorer](https://stellar.expert/explorer/testnet/contract/CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE)

## 🎉 Success Criteria

- [x] Smart contract deployed and functional on Testnet
- [x] All 5 contract functions working correctly
- [x] Atomic swap in buy_token is robust
- [x] Frontend displays live queue data
- [x] Wallet connection via Freighter works
- [x] Users can join queue and receive NFT
- [x] Users can list tokens for sale
- [x] Users can buy listed tokens (XLM/NFT swap)
- [x] QR code verification flow works end-to-end
- [x] Clean, modern UI with good UX
- [x] Complete documentation

## 📄 License

This project is built for educational and demonstration purposes as part of a hackathon submission.

---

**Built with ❤️ on Stellar Blockchain**

