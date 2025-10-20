<div align="center">


# Try the Demo Yourself, Live 🎮 
# Deployed and Ready for Your Experience 


https://stellar-challenge.vercel.app/




# Demo Video 📸

https://github.com/user-attachments/assets/3a866ff2-a9b6-4143-977a-b95ce62dfd84



# ⚡ StellarSkip

### *Stop Wasting Time. Start Trading It.*
### *Made For Fullstack Challenge*

**The first decentralized marketplace for physical queue positions**

![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=for-the-badge&logo=stellar)
![Soroban](https://img.shields.io/badge/Soroban-Smart_Contracts-FF6B35?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)

</div>

---

## 💡 The Problem

You're 15th in line at your favorite coffee shop. Your meeting starts in 10 minutes. **What are your options?**

❌ Wait and be late  
❌ Leave without coffee  
❌ Skip the line (unfair to others)  
❌ Beg someone to swap (awkward & unreliable)

**There's no fair, transparent way to trade queue positions.**

---

## ✨ The Solution

**StellarSkip** transforms waiting time into a tradable asset using blockchain technology.

### 🎫 How It Works

```
1️⃣ Join Queue → Receive NFT representing your position
2️⃣ List for Sale → Set your price in XLM
3️⃣ Someone Buys → Instant atomic swap (XLM ↔ Position)
4️⃣ Verify → Scan QR code to prove ownership on-chain
```

<div align="center">

### **🔥 Mint → Trade → Verify**

*A complete marketplace for time itself*

</div>

---

## 🌟 Why StellarSkip?

<table>
<tr>
<td width="50%" valign="top">

### 💸 **For Queue Members**
- **Sell** your spot when you have time
- **Buy** a better position when you're in a hurry
- **Fair pricing** set by free market
- **Instant transactions** on Stellar blockchain
- **Provable ownership** via blockchain

</td>
<td width="50%" valign="top">

### 🏪 **For Venues**
- **Reduce frustration** from long waits
- **Increase satisfaction** with flexible options
- **New revenue stream** (optional fee per trade)
- **Better queue management** & analytics
- **Modern customer experience**

</td>
</tr>
</table>

---

## 🎯 Real-World Use Cases

<table>
<tr>
<td align="center" width="25%">
<h3>☕ Coffee Shops</h3>
<p><i>"Trade spots during morning rush"</i></p>
<b>Price: 2-10 XLM</b>
</td>
<td align="center" width="25%">
<h3>🎢 Theme Parks</h3>
<p><i>"Skip 2-hour waits for rides"</i></p>
<b>Price: 50-200 XLM</b>
</td>
<td align="center" width="25%">
<h3>🎵 Concert Entry</h3>
<p><i>"Guarantee entry, trade position"</i></p>
<b>Price: 100-500 XLM</b>
</td>
<td align="center" width="25%">
<h3>🏛️ Government Services</h3>
<p><i>"DMV, passport appointments"</i></p>
<b>Price: 20-100 XLM</b>
</td>
</tr>
</table>

**The possibilities are endless.** Any queue, anywhere, can become a marketplace.

---

## 🚀 Key Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Wallet Integration** | Connect with Freighter, sign transactions securely | ✅ Live |
| 🎫 **Mint Queue Token** | Join queue → Get sequential NFT position | ✅ Live |
| 💰 **List for Sale** | Set your price in XLM, list instantly | ✅ Live |
| ⚡ **Atomic Swaps** | XLM ↔ NFT trade (both succeed or both fail) | ✅ Live |
| 📱 **QR Verification** | Prove ownership on-chain, instant verification | ✅ Live |
| 🔄 **Live Updates** | Real-time queue & price updates | ✅ Live |
| 🌐 **Decentralized** | No central authority, trustless trading | ✅ Live |

</div>

---

## 🎬 See It In Action

### 💼 Example: Morning Coffee Rush

```
📍 Downtown Coffee Shop
⏰ 8:00 AM Monday
👥 10 people in queue
⏱️  15 min wait per person

Position #10 (John):    Has urgent meeting, buys #2 for 8 XLM
Position #2 (Sarah):    Remote worker, sells to John, gets 8 XLM
                        
Result: John saves 2 hours, Sarah earns coffee money
        ✨ Fair trade, instant settlement, blockchain verified
```

### 🔄 The Flow

1. **Sarah** (Position #2): *"I can wait, let me earn some XLM"*
   - Lists position #2 for 8 XLM

2. **John** (Position #10): *"I'm late, I'll pay to skip ahead"*
   - Buys position #2 for 8 XLM
   - **Atomic Swap Executes:**
     - ✅ 8 XLM → Sarah
     - ✅ Position #2 NFT → John
     - ✅ Both happen or neither happens (no fraud!)

3. **Barista**: *"Show me your QR code"*
   - Scans John's QR
   - Blockchain confirms: John owns position #2 ✅
   - Coffee served!

---

## 🏗️ How It Works (Technical)

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │◄────►│   Freighter  │◄────►│   Stellar   │
│  (Next.js)  │      │    Wallet    │      │   Testnet   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                                            │
       │                                            │
       └───────────────────────────────────────────┘
                    Smart Contract
                   (Soroban/Rust)
```

### Smart Contract Functions

| Function | What It Does |
|----------|--------------|
| `init_queue()` | Initialize new queue with admin |
| `join_queue()` | Mint sequential NFT to user |
| `list_for_sale()` | Set XLM price for your position |
| `buy_token()` | **Atomic swap**: XLM ↔ NFT transfer |
| `owner_of()` | Verify token ownership (for QR scan) |

### Tech Stack

<div align="center">

**Frontend:** Next.js 15 • TypeScript • Tailwind CSS  
**Smart Contract:** Rust • Soroban SDK  
**Blockchain:** Stellar Testnet  
**Wallet:** Freighter API  
**QR Codes:** qrcode.react • html5-qrcode

</div>

---

## 🚀 Quick Start

### Option 1: Try the Live Demo (2 minutes)

```bash
# 1. Clone & install
git clone <repo>
cd StellarChallenge/frontend
npm install

# 2. Start frontend
npm run dev

# 3. Open http://localhost:3000
# 4. Install Freighter Wallet & connect
# 5. Join queue, trade positions!
```

### Option 2: Deploy Your Own (10 minutes)

```bash
# 1. Build & deploy contract
cd contract/queue-contract
stellar contract build
stellar contract deploy --wasm target/wasm32v1-none/release/hello_world.wasm --source alice --network testnet

# 2. Update frontend with new contract ID
# Edit: frontend/lib/stellar.ts

# 3. Start frontend
cd frontend && npm run dev
```

---

## 🎯 For Hackathon Judges

### ✅ What We Built

✓ **Complete MVP** - Fully functional on Stellar Testnet  
✓ **Atomic Swaps** - Robust XLM ↔ NFT exchanges  
✓ **Real-World Ready** - QR verification for physical use  
✓ **Modern UX** - Clean, intuitive interface  
✓ **Well Documented** - Comprehensive guides & scripts

### 💎 Innovation Highlights

- **First** queue marketplace on Stellar
- **Atomic swaps** ensure trustless trades
- **NFT utility** beyond art - represents real value
- **Practical application** solving everyday problems
- **Scalable** to any queue, anywhere

### 🧪 Test It Yourself

```bash
# Automated demo setup (creates 10 users with realistic prices)
cd StellarChallenge
./setup_demo.sh

# Queue management utilities
./queue_utils.sh status      # Check queue
./queue_utils.sh list         # List all tokens
./reset_queue.sh              # Fresh start
```

---

## 📊 Market Opportunity

### The Waiting Problem

- ⏰ Americans spend **37 billion hours** waiting annually
- 💵 Value: **$75-100 billion** in lost time
- 😤 70% of customers cite wait times as top frustration
- 🏃 28% abandon queues, businesses lose sales

### StellarSkip Solution

- 💰 **Monetize** waiting time for those with flexibility
- ⚡ **Save time** for those willing to pay
- 📈 **Optimize** queue efficiency naturally
- ✅ **Fair & transparent** blockchain-based system

---

## 🎨 Screenshots

<div align="center">

### Main Dashboard
*Connect wallet, view queue, join marketplace*

### Queue List
*Browse positions, see prices, buy instantly*

### My Token
*Your position NFT with QR code for verification*

### Verifier
*Scan QR codes to confirm ownership on-chain*

</div>

---

## 🔐 Security & Trust

### Blockchain Guarantees

✅ **Atomic Swaps** - XLM and NFT transfer together or not at all  
✅ **On-Chain Ownership** - Verifiable, immutable record  
✅ **User Signatures** - All actions require wallet approval  
✅ **No Middleman** - Direct peer-to-peer trades  
✅ **Transparent** - All transactions public on blockchain

### How We Prevent Fraud

- 🔒 QR codes contain only token ID (public data)
- 🔒 Ownership verified on-chain via smart contract
- 🔒 Can't fake NFT ownership (blockchain-verified)
- 🔒 Can't double-spend positions (atomic swaps)
- 🔒 Can't reverse trades (immutable ledger)

---

## 🌍 Future Roadmap

<table>
<tr>
<td width="33%">

### 📍 Phase 1: MVP ✅
- [x] Single queue
- [x] Basic trading
- [x] QR verification
- [x] Testnet deployment

</td>
<td width="33%">

### 🚀 Phase 2: Scale
- [x] Multiple queues
- [x] Real-time notifications
- [ ] Mobile app
- [ ] Venue integrations

</td>
<td width="33%">

### 🌟 Phase 3: Expand
- [ ] Mainnet launch
- [ ] Geo-fencing
- [ ] Dynamic pricing
- [ ] Analytics dashboard

</td>
</tr>
</table>

---

## 📖 Detailed Setup

### Prerequisites

- **Rust** (latest stable) - [Install](https://rustup.rs/)
- **Stellar CLI** v23+ - [Install](https://developers.stellar.org/docs/smart-contracts/getting-started/setup)
- **Node.js** v18+ - [Install](https://nodejs.org/)
- **Freighter Wallet** - [Install](https://freighter.app)

### Smart Contract Deployment

```bash
# 1. Build contract
cd contract/queue-contract
stellar contract build

# 2. Configure network
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# 3. Create & fund identity
stellar keys generate alice --network testnet
curl "https://friendbot.stellar.org/?addr=$(stellar keys address alice)"

# 4. Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias queue_contract

# 5. Initialize
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- init_queue \
  --admin $(stellar keys address alice)
```

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Update contract ID (if you deployed new one)
# Edit: lib/stellar.ts
# export const CONTRACT_ID = "YOUR_NEW_CONTRACT_ID"

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 🤝 Contributing

We welcome contributions! This is an open-source hackathon project.

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Ideas for Contribution

- 🎨 UI/UX improvements
- 🔧 Additional features
- 📱 Mobile app version
- 🌐 Multi-language support
- 📊 Analytics dashboard

---

### Quick Commands

```bash
# Setup demo data
./setup_demo.sh

# Check queue status
./queue_utils.sh status

# Reset everything
./reset_queue.sh
```

---

## 📜 License

This project is built for educational and demonstration purposes as part of a hackathon submission.

---

<div align="center">

## 🌟 Star This Repo

*If you find StellarSkip innovative, give us a star!*

### Built with ❤️ on Stellar Blockchain

**Making waiting time tradable, one queue at a time.**

---

[⬆ Back to Top](#-stellarskip)

</div>
