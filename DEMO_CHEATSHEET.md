# 🎯 StellarSkip Demo Cheat Sheet

> **Quick reference for live demos** - Print this or keep it on a second screen!

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Run demo setup script
cd /home/lkilic/StellarChallenge
./setup_demo.sh

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## 📊 Demo Data (What You'll See)

| Pos | Owner | Price | Status |
|-----|-------|-------|--------|
| #0  | demo1 | -     | ❌ Not listed |
| #1  | demo2 | 10 XLM | ✅ FOR SALE |
| #2  | demo3 | 8 XLM  | ✅ FOR SALE |
| #3  | demo4 | -      | ❌ Not listed |
| #4  | demo5 | 6 XLM  | ✅ FOR SALE |
| #5  | demo6 | 5.5 XLM | ✅ FOR SALE |
| #6  | demo7 | -      | ❌ Not listed |
| #7  | demo8 | 3.5 XLM | ✅ FOR SALE |
| #8  | demo9 | -      | ❌ Not listed |
| #9  | demo10| 2 XLM  | ✅ FOR SALE |

**Market Summary**: 6/10 for sale, 2-10 XLM range

---

## 🎬 Demo Script (5 minutes)

### 1. THE HOOK (30 sec)
> "You're #11 at a coffee shop. Meeting in 10 minutes. What do you do?"

**Action**: Show queue list

### 2. THE SOLUTION (30 sec)
> "StellarSkip: Buy someone's spot, sell yours. Blockchain-verified."

**Action**: Point to prices, highlight marketplace

### 3. THE DEMO (2 min)
> "Let's buy position #9 for 2 XLM"

**Actions**:
1. Click "Buy" on position #9
2. Show Freighter popup
3. Explain atomic swap
4. Approve transaction
5. Show success ✅

### 4. THE PROOF (1 min)
> "QR code proves ownership on-chain"

**Actions**:
1. Go to "My Token" tab
2. Show QR code
3. Go to "Verifier" tab
4. Scan/enter token ID
5. Show ownership verification

### 5. THE VISION (1 min)
> "Not just coffee - DMVs, concerts, anywhere people queue"

**Action**: Show use case slides/scenarios

---

## 💬 Key Talking Points

### What It Is
✅ "NFT marketplace for physical queue positions"  
✅ "Trustless trading via Stellar blockchain"  
✅ "Atomic swaps: XLM ↔ position, both or neither"

### Why It Matters
✅ "Time is money - make it tradable"  
✅ "Fair, transparent, instant"  
✅ "Reduces frustration, increases efficiency"

### How It Works
✅ "Join queue → Get NFT"  
✅ "List for sale → Set XLM price"  
✅ "Someone buys → Instant atomic swap"  
✅ "Verify ownership → Scan QR, check blockchain"

---

## 🔥 Live Demo Actions

### Connect Wallet
```
1. Click "Connect Wallet"
2. Approve in Freighter
3. Show connected address
```

### Join Queue
```
1. Click "🎫 Join Queue"
2. Approve in Freighter
3. You're now position #10 or #11
4. Go to "My Token" tab
5. Show your QR code
```

### Buy a Position
```
1. Go to "Queue List" tab
2. Click "Buy" on position #9 (2 XLM)
3. Show Freighter transaction:
   - 2 XLM payment
   - NFT transfer
4. Approve
5. Show success message
6. Show updated position
```

### Verify Ownership
```
1. Go to "Verifier" tab
2. Enter token ID: 9
3. Click "Verify"
4. Show: Token #9 owned by [your address]
```

### List Your Position
```
1. Go to "My Token" tab
2. Enter price: e.g., 3.5
3. Click "List"
4. Approve in Freighter
5. Show "Listed for 3.5 XLM"
```

---

## 📱 Contract Commands (Backup/Verification)

### Check Queue Size
```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- get_next_token_id
```

### Check Owner
```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- owner_of \
  --token_id 5
```

### Check Price
```bash
stellar contract invoke \
  --id queue_contract \
  --source alice \
  --network testnet \
  -- get_price \
  --token_id 5
```

---

## 🎯 Anticipated Questions & Answers

### Q: "What stops fake QR codes?"
**A**: "The QR code is just the token ID. Verification calls the blockchain contract - can't be faked!"

### Q: "What if venue doesn't accept this?"
**A**: "Venues can integrate a verifier scanner. Or users show both traditional ticket + blockchain proof."

### Q: "How much are fees?"
**A**: "Stellar fees are ~0.00001 XLM per transaction. Nearly free!"

### Q: "Can I sell for more than I bought?"
**A**: "Absolutely! Free market pricing. Early positions are worth more."

### Q: "What about refunds if queue closes?"
**A**: "Smart contract could include refund logic, outside MVP scope."

### Q: "Multiple queues?"
**A**: "Yes! Each queue is a separate contract instance."

### Q: "Mainnet ready?"
**A**: "This is Testnet. Mainnet deployment would need auditing + real XLM."

---

## 🚨 Troubleshooting

### Frontend won't connect
- ✅ Check Freighter is on TESTNET
- ✅ Refresh page
- ✅ Check `npm run dev` is running

### Transaction fails
- ✅ Check sufficient XLM (need ~5+ for gas)
- ✅ Verify on Testnet, not Mainnet
- ✅ Token might already be sold

### QR scanner doesn't work
- ✅ Grant camera permissions
- ✅ Use manual token ID entry instead
- ✅ Good lighting for QR scanning

### Demo data missing
- ✅ Re-run `./setup_demo.sh`
- ✅ Check contract ID matches in code
- ✅ Verify network is Testnet

---

## 📊 Demo Flow Diagram

```
START
  ├─> Connect Wallet (30s)
  ├─> Show Queue List (30s)
  ├─> Buy Position #9 (2 min)
  │    ├─> Click Buy
  │    ├─> Show Freighter
  │    ├─> Explain Atomic Swap
  │    ├─> Approve
  │    └─> Show Success
  ├─> Verify with QR (1 min)
  │    ├─> My Token tab
  │    ├─> Show QR
  │    ├─> Verifier tab
  │    └─> Confirm ownership
  └─> Wrap Up + Q&A (1 min)
END
```

---

## 🎪 Advanced Demo Tricks

### Live Price Discovery
```
While demoing, have assistant:
1. Lower price on position #5
2. Show real-time market change
3. Demonstrate dynamic pricing
```

### Competitive Buying
```
Set up: Two volunteers with wallets
Challenge: Both try to buy same position
Result: Only one succeeds (atomic!)
Lesson: Blockchain prevents double-spend
```

### QR Scanning Race
```
Set up: 5 people with phone QR codes
Action: Scan all 5 quickly
Result: All verify instantly
Lesson: Scalable verification
```

---

## 📋 Pre-Demo Checklist

**Environment**:
- [ ] `./setup_demo.sh` completed
- [ ] Frontend running on :3000
- [ ] Freighter on TESTNET
- [ ] Personal wallet funded (20+ XLM)

**Presentation**:
- [ ] HDMI/screen sharing working
- [ ] Browser tabs ready (frontend + explorer)
- [ ] Backup device ready (phone for QR)
- [ ] This cheat sheet visible

**Demo Flow**:
- [ ] Practiced 1-2 times
- [ ] Know where each tab is
- [ ] Freighter unlocked
- [ ] Emergency backup wallet ready

---

## 🔗 Important URLs

**Frontend**: http://localhost:3000

**Contract**: CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE

**Explorer**: https://stellar.expert/explorer/testnet/contract/CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE

**Freighter**: https://freighter.app

---

## 💪 Confidence Boosters

✨ **You've got this!**
- Contract is deployed ✅
- Demo data is loaded ✅
- Frontend is tested ✅
- Flow is simple ✅

🎯 **Remember**:
- Slow down, let UI load
- Explain as you click
- Emphasize "atomic swap"
- Make it relatable (coffee!)
- Have fun with it!

🚀 **The message**:
"We're making waiting time tradable. Fair, transparent, instant. The future of queues."

---

**Good luck! You're going to nail this demo! 🎉**

