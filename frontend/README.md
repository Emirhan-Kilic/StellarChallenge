# 🎨 StellarSkip Frontend

> **Modern, responsive web interface for the StellarSkip queue marketplace**

Built with Next.js 15, TypeScript, and Tailwind CSS

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🎯 What's Inside

### 🔗 Connected to Stellar Testnet

- **Network**: Stellar Testnet
- **Contract**: `CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE`
- **RPC**: `https://soroban-testnet.stellar.org:443`

> **Note**: To use a different contract, update `CONTRACT_ID` in `lib/stellar.ts`

---

## 📦 Core Components

### 🔐 **WalletConnect.tsx**
- Freighter wallet integration
- Connect/disconnect functionality
- Display wallet address
- Handle authorization

### 📋 **QueueList.tsx**
- Live queue display
- Token browsing
- Buy functionality
- Price display in XLM

### 🎫 **MyToken.tsx**
- User's token display
- QR code generation
- List for sale interface
- Price setting

### ✅ **Verifier.tsx**
- QR code scanner
- Token verification
- Ownership confirmation
- Visual feedback

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **@stellar/stellar-sdk** | Blockchain interaction |
| **@stellar/freighter-api** | Wallet connection |
| **qrcode.react** | QR code generation |
| **html5-qrcode** | QR code scanning |

---

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/
│   ├── WalletConnect.tsx     # Wallet integration
│   ├── QueueList.tsx         # Queue display
│   ├── MyToken.tsx           # Token & QR code
│   └── Verifier.tsx          # QR scanner
│
├── lib/
│   ├── stellar.ts            # Smart contract interaction
│   │   ├── Transaction builders
│   │   ├── Data fetchers
│   │   └── Contract utilities
│   │
│   └── freighter.ts          # Wallet integration
│       ├── Connect/disconnect
│       ├── Sign transactions
│       └── Get address
│
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Key Features

### 💎 Modern UI/UX
- Clean, minimal design
- Responsive layout
- Loading states
- Error handling
- Toast notifications

### ⚡ Performance Optimized
- Parallel RPC calls
- Batch processing
- Smart caching
- Lazy loading

### 🔐 Security First
- Wallet signature required
- No private keys stored
- Client-side only
- Secure transaction signing

---

## 🚀 Development

### Environment Variables (Optional)

Create `.env.local` if you need custom config:

```env
NEXT_PUBLIC_CONTRACT_ID=your_contract_id
NEXT_PUBLIC_RPC_URL=your_rpc_url
```

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Create optimized build
npm run build

# Test production build
npm start
```

---

## 🔧 Configuration

### Update Contract ID

Edit `lib/stellar.ts`:

```typescript
export const CONTRACT_ID = "YOUR_NEW_CONTRACT_ID";
```

### Update Network

Edit `lib/stellar.ts`:

```typescript
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const RPC_URL = "https://soroban-testnet.stellar.org:443";
```

---

## 🎯 User Flows

### 1️⃣ Connect Wallet
```
User clicks "Connect Wallet"
→ Freighter popup appears
→ User approves connection
→ Wallet address displayed
```

### 2️⃣ Join Queue
```
User clicks "Join Queue"
→ Transaction built
→ Freighter asks for signature
→ User approves
→ NFT minted to user
→ Token displayed in "My Token"
```

### 3️⃣ List for Sale
```
User enters price in XLM
→ Clicks "List"
→ Transaction signed
→ Token marked for sale
→ Appears in marketplace
```

### 4️⃣ Buy Token
```
User browses queue
→ Clicks "Buy" on token
→ Signs transaction
→ Atomic swap executes
→ NFT ownership transferred
→ XLM paid to seller
```

### 5️⃣ Verify Ownership
```
Verifier scans QR code
→ Token ID extracted
→ owner_of() called
→ Blockchain confirms owner
→ Visual confirmation shown
```

---

## 🐛 Troubleshooting

### Wallet Won't Connect
```bash
✅ Check Freighter is installed
✅ Check Freighter is unlocked
✅ Refresh the page
✅ Check browser console for errors
```

### Prices Show "NaN"
```bash
✅ Contract might be outdated
✅ Check contract ID is correct
✅ Verify network is Testnet
✅ Check RPC connection
```

### Transactions Fail
```bash
✅ Ensure sufficient XLM for fees
✅ Check you're on Testnet
✅ Verify wallet has funds
✅ Check contract is initialized
```

### Slow Loading
```bash
✅ Check internet connection
✅ RPC might be slow
✅ Try refreshing page
✅ Clear browser cache
```

---

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Stellar Resources
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [Freighter API](https://docs.freighter.app/)
- [Soroban Docs](https://soroban.stellar.org/)

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use TypeScript for all files
- Follow ESLint configuration
- Use Tailwind for styling
- Write meaningful component names

---

## 📄 License

Part of the StellarSkip project - built for educational purposes.

---

<div align="center">

**Built with ❤️ using Next.js & Stellar**

[⬆ Back to Top](#-stellarskip-frontend)

</div>
