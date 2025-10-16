# StellarSkip Frontend

Next.js frontend for the StellarSkip queue marketplace.

## Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Environment

The frontend is configured to connect to:
- **Network**: Stellar Testnet  
- **Contract ID**: `CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE`  
- **RPC URL**: `https://soroban-testnet.stellar.org:443`

To use a different contract, update `CONTRACT_ID` in `lib/stellar.ts`.

## Key Components

- **WalletConnect**: Freighter wallet integration
- **QueueList**: Display and buy tokens
- **MyToken**: Show user's token with QR code
- **Verifier**: Scan QR codes to verify ownership

## Development

Open [http://localhost:3000](http://localhost:3000) in your browser.

Make sure you have Freighter Wallet installed!
