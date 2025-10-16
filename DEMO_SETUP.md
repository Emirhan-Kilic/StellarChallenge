# 🎬 StellarSkip Demo Setup Guide

This guide will help you populate the queue with realistic demo data for presentations and testing.

## 📊 Realistic Demo Scenario

**Scenario**: Coffee shop queue at 8 AM Monday morning
- 10 people in queue
- First 3 positions are premium (closest to getting coffee)
- Mix of listed and unlisted tokens
- Realistic pricing based on position value

### Pricing Strategy
- **Position #0** (First in line): 12-15 XLM - Most valuable!
- **Position #1-2**: 8-10 XLM - Very close to front
- **Position #3-5**: 5-7 XLM - Middle positions
- **Position #6-9**: 2-4 XLM - Back of queue

## 🚀 Quick Demo Setup (Automated)

### Step 1: Create Demo Users

```bash
cd /home/lkilic/StellarChallenge/contract/queue-contract

# Create 10 demo users
for i in {1..10}; do
  stellar keys generate demo$i --network testnet
done
```

### Step 2: Fund All Demo Users

```bash
# Fund all demo accounts
for i in {1..10}; do
  echo "Funding demo$i..."
  ADDRESS=$(stellar keys address demo$i)
  curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
  echo "✓ demo$i funded"
  sleep 2  # Be nice to friendbot
done
```

### Step 3: Join Queue (All Users)

```bash
# Each user joins the queue
for i in {1..10}; do
  echo "demo$i joining queue..."
  stellar contract invoke \
    --id queue_contract \
    --source demo$i \
    --network testnet \
    -- join_queue \
    --user $(stellar keys address demo$i)
  sleep 1
done
```

### Step 4: List Tokens for Sale (Selective)

```bash
# Position #0 - Not for sale (keeping first spot!)
# Position #1 - Listed for 10 XLM
stellar contract invoke \
  --id queue_contract \
  --source demo2 \
  --network testnet \
  -- list_for_sale \
  --token_id 1 \
  --price 100000000

# Position #2 - Listed for 8 XLM
stellar contract invoke \
  --id queue_contract \
  --source demo3 \
  --network testnet \
  -- list_for_sale \
  --token_id 2 \
  --price 80000000

# Position #4 - Listed for 6 XLM
stellar contract invoke \
  --id queue_contract \
  --source demo5 \
  --network testnet \
  -- list_for_sale \
  --token_id 4 \
  --price 60000000

# Position #5 - Listed for 5.5 XLM
stellar contract invoke \
  --id queue_contract \
  --source demo6 \
  --network testnet \
  -- list_for_sale \
  --token_id 5 \
  --price 55000000

# Position #7 - Listed for 3.5 XLM
stellar contract invoke \
  --id queue_contract \
  --source demo8 \
  --network testnet \
  -- list_for_sale \
  --token_id 7 \
  --price 35000000

# Position #9 - Listed for 2 XLM (desperate to sell!)
stellar contract invoke \
  --id queue_contract \
  --source demo10 \
  --network testnet \
  -- list_for_sale \
  --token_id 9 \
  --price 20000000
```

## 🎯 Expected Demo Queue State

After running the above commands, your queue will look like:

| Position | Owner | For Sale? | Price (XLM) | Description |
|----------|-------|-----------|-------------|-------------|
| #0 | demo1 | ❌ No | - | First in line - Not selling! |
| #1 | demo2 | ✅ Yes | 10.0 | Premium spot |
| #2 | demo3 | ✅ Yes | 8.0 | Great position |
| #3 | demo4 | ❌ No | - | Keeping spot |
| #4 | demo5 | ✅ Yes | 6.0 | Mid-queue |
| #5 | demo6 | ✅ Yes | 5.5 | Mid-queue |
| #6 | demo7 | ❌ No | - | Keeping spot |
| #7 | demo8 | ✅ Yes | 3.5 | Back half |
| #8 | demo9 | ❌ No | - | Keeping spot |
| #9 | demo10 | ✅ Yes | 2.0 | Last spot - bargain! |

## 🎭 Demo Script for Presentation

### Opening (30 seconds)
1. Show empty queue on frontend
2. Explain the concept: "Physical queue spots as tradable NFTs"

### Act 1: Joining (1 minute)
1. Connect your Freighter wallet
2. Click "Join Queue" → Become position #11
3. Show your QR code in "My Token" tab
4. Explain: "This QR code proves ownership on-chain"

### Act 2: The Marketplace (2 minutes)
1. Switch to "Queue List" tab
2. Point out various positions and prices:
   - "Position #1 is listed for 10 XLM - someone really wants their coffee!"
   - "Position #9 is only 2 XLM - a bargain for jumping ahead"
3. Show the price gradient (expensive → cheap)

### Act 3: Atomic Swap Demo (2 minutes)
1. "Let's buy position #9 for 2 XLM"
2. Click "Buy" button
3. Show Freighter transaction:
   - XLM payment to seller
   - NFT transfer to buyer
   - ALL OR NOTHING (atomic)
4. Approve transaction
5. Show success + updated queue

### Act 4: Verification (1 minute)
1. Switch to "Verifier" tab
2. Show QR code from your phone/another device
3. Scan or manually enter token ID
4. "Barista verifies ownership on-chain - no fake tickets!"

### Finale (30 seconds)
1. Show updated "My Token" - now position #9
2. "Could list it for sale immediately if I wanted"
3. Emphasize: Trustless, transparent, instant

## 🔄 Reset Demo (Start Fresh)

If you need to reset and start over:

```bash
# Clear all demo identities
for i in {1..10}; do
  rm -f ~/.config/stellar/identity/demo$i.toml
done

# Deploy a fresh contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias queue_contract_new

# Initialize new contract
stellar contract invoke \
  --id queue_contract_new \
  --source alice \
  --network testnet \
  -- init_queue \
  --admin $(stellar keys address alice)

# Update frontend/lib/stellar.ts with new CONTRACT_ID
```

## 💡 Interactive Demo Ideas

### Scenario 1: Lunch Rush
**Story**: "It's noon, everyone wants lunch, queue is valuable"
- 15 people in queue
- Higher prices (15-30 XLM for front positions)
- More active trading

### Scenario 2: Theme Park Ride
**Story**: "2-hour wait for the new roller coaster"
- 20+ people in queue
- Very high prices for front (50-100 XLM)
- Show secondary market value

### Scenario 3: Concert Entry
**Story**: "Doors open in 10 minutes, limited capacity"
- 30 people, only 20 get in
- Dramatic price differences
- Time-sensitive trading

## 🎪 Advanced Demo Features

### Show Live Trading
```bash
# While presenting, have a helper buy/sell in real-time
# Creates dynamic marketplace feel
```

### Multiple Devices
- Phone: Show QR code
- Laptop: Show verifier scanning
- Creates real-world visualization

### Price Discovery
```bash
# Demonstrate market dynamics
# Lower price on position #5
stellar contract invoke \
  --id queue_contract \
  --source demo6 \
  --network testnet \
  -- list_for_sale \
  --token_id 5 \
  --price 40000000  # Now 4 XLM (was 5.5)
```

## 📱 Mobile Demo Setup

For showing the verifier on mobile:
1. Open frontend URL on phone: `http://YOUR_IP:3000`
2. Connect Freighter mobile (if available)
3. Show QR code generation
4. Use laptop to verify

## 🔍 Verification Commands

Check queue state:
```bash
# See total tokens
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- get_next_token_id

# Check specific owner
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- owner_of \
  --token_id 5

# Check price
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- get_price \
  --token_id 5
```

## 🎬 Complete Setup Script

Save this as `setup_demo.sh`:

```bash
#!/bin/bash

echo "🎬 Setting up StellarSkip Demo Data..."

cd /home/lkilic/StellarChallenge/contract/queue-contract

# 1. Create users
echo "📝 Creating 10 demo users..."
for i in {1..10}; do
  stellar keys generate demo$i --network testnet 2>/dev/null || true
done

# 2. Fund users
echo "💰 Funding demo users..."
for i in {1..10}; do
  ADDRESS=$(stellar keys address demo$i)
  curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
  echo "  ✓ demo$i funded"
  sleep 2
done

# 3. Join queue
echo "🎫 Joining queue..."
for i in {1..10}; do
  stellar contract invoke \
    --id queue_contract \
    --source demo$i \
    --network testnet \
    -- join_queue \
    --user $(stellar keys address demo$i) > /dev/null
  echo "  ✓ demo$i joined (position $((i-1)))"
  sleep 1
done

# 4. List tokens
echo "💵 Listing tokens for sale..."

stellar contract invoke --id queue_contract --source demo2 --network testnet -- list_for_sale --token_id 1 --price 100000000 > /dev/null
echo "  ✓ Position #1 listed for 10 XLM"

stellar contract invoke --id queue_contract --source demo3 --network testnet -- list_for_sale --token_id 2 --price 80000000 > /dev/null
echo "  ✓ Position #2 listed for 8 XLM"

stellar contract invoke --id queue_contract --source demo5 --network testnet -- list_for_sale --token_id 4 --price 60000000 > /dev/null
echo "  ✓ Position #4 listed for 6 XLM"

stellar contract invoke --id queue_contract --source demo6 --network testnet -- list_for_sale --token_id 5 --price 55000000 > /dev/null
echo "  ✓ Position #5 listed for 5.5 XLM"

stellar contract invoke --id queue_contract --source demo8 --network testnet -- list_for_sale --token_id 7 --price 35000000 > /dev/null
echo "  ✓ Position #7 listed for 3.5 XLM"

stellar contract invoke --id queue_contract --source demo10 --network testnet -- list_for_sale --token_id 9 --price 20000000 > /dev/null
echo "  ✓ Position #9 listed for 2 XLM"

echo ""
echo "✨ Demo setup complete!"
echo ""
echo "📊 Queue Status:"
echo "  Total positions: 10"
echo "  For sale: 6"
echo "  Not for sale: 4"
echo ""
echo "🚀 Open http://localhost:3000 and start your demo!"
```

Make executable:
```bash
chmod +x setup_demo.sh
./setup_demo.sh
```

## 📋 Pre-Demo Checklist

- [ ] Freighter wallet installed and set to Testnet
- [ ] Frontend running: `npm run dev`
- [ ] Demo script executed successfully
- [ ] Personal wallet funded with XLM
- [ ] Browser tabs ready (frontend + explorer)
- [ ] Second device ready for QR demo (optional)
- [ ] Talking points prepared

## 🎉 You're Ready!

Your demo marketplace is now populated with:
- ✅ 10 queue positions
- ✅ 6 tokens listed for sale
- ✅ Realistic price distribution
- ✅ Ready for live trading demo

**Go wow your audience! 🚀**

