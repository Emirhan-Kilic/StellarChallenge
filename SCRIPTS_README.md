# 🛠️ StellarSkip Management Scripts

Utility scripts for managing your StellarSkip queue contracts and demo data.

## 📜 Available Scripts

### 1. `reset_queue.sh` - Complete Queue Reset
**Purpose**: Deploy a fresh contract and start over with a clean queue.

**What it does**:
- ✅ Builds the smart contract
- ✅ Deploys fresh contract to Testnet
- ✅ Initializes the contract
- ✅ Updates frontend configuration automatically
- ✅ Optionally sets up demo data (10 users with prices)
- ✅ Backs up old configuration

**Usage**:
```bash
cd /home/lkilic/StellarChallenge
./reset_queue.sh
```

**When to use**:
- Queue is messy with too many tokens
- Want to start fresh for a demo
- Testing new contract changes
- Need a clean slate

**Example Output**:
```
╔════════════════════════════════════════╗
║   StellarSkip Queue Reset Script      ║
╔════════════════════════════════════════╗

📦 Step 1: Building smart contract...
✅ Contract built successfully

🚀 Step 2: Deploying fresh contract to Testnet...
✅ Contract deployed!
   Contract ID: CBXYZ...

🔧 Step 3: Initializing contract...
✅ Contract initialized

📝 Step 4: Updating frontend configuration...
✅ Frontend updated

Do you want to set up demo data? (y/n)
```

---

### 2. `setup_demo.sh` - Populate Demo Data
**Purpose**: Populate the current queue with realistic demo data.

**What it does**:
- ✅ Creates 10 demo users (demo1-demo10)
- ✅ Funds them with testnet XLM
- ✅ Makes them join the queue
- ✅ Lists 6 positions for sale at realistic prices

**Usage**:
```bash
cd /home/lkilic/StellarChallenge
./setup_demo.sh
```

**Demo Data Created**:
| Position | Owner | Price | Status |
|----------|-------|-------|--------|
| #0 | demo1 | - | Not listed |
| #1 | demo2 | 10 XLM | FOR SALE |
| #2 | demo3 | 8 XLM | FOR SALE |
| #3 | demo4 | - | Not listed |
| #4 | demo5 | 6 XLM | FOR SALE |
| #5 | demo6 | 5.5 XLM | FOR SALE |
| #6 | demo7 | - | Not listed |
| #7 | demo8 | 3.5 XLM | FOR SALE |
| #8 | demo9 | - | Not listed |
| #9 | demo10 | 2 XLM | FOR SALE |

**When to use**:
- Preparing for a demo
- Testing marketplace functionality
- Want realistic price distribution

---

### 3. `queue_utils.sh` - Queue Utilities
**Purpose**: Check queue status and inspect tokens.

**Commands**:

#### Check Queue Status
```bash
./queue_utils.sh status
```
Shows:
- Contract ID
- Total tokens in queue
- How many are for sale
- How many are not listed

#### List All Tokens
```bash
./queue_utils.sh list
```
Shows table with:
- Position number
- Owner (truncated)
- Price in XLM
- Sale status

#### Get Token Owner
```bash
./queue_utils.sh owner <token_id>
```
Example:
```bash
./queue_utils.sh owner 5
```

#### Get Token Price
```bash
./queue_utils.sh price <token_id>
```
Example:
```bash
./queue_utils.sh price 3
```

#### Show Contract Info
```bash
./queue_utils.sh info
```
Shows:
- Contract ID
- Network details
- Explorer link
- Frontend config location

#### Show Help
```bash
./queue_utils.sh help
```

**When to use**:
- Quick queue inspection
- Debug token ownership
- Check prices without opening browser
- Get contract details

---

## 🚀 Common Workflows

### Workflow 1: Fresh Start for Demo
```bash
# 1. Reset everything
./reset_queue.sh
# Answer 'y' when asked about demo data

# 2. Start frontend
cd frontend
npm run dev

# 3. Open http://localhost:3000
```

### Workflow 2: Check Queue Before Demo
```bash
# Quick status check
./queue_utils.sh status

# See all tokens
./queue_utils.sh list

# Check specific token
./queue_utils.sh price 1
```

### Workflow 3: Re-populate Demo Data
```bash
# If queue exists but empty, just add demo users
./setup_demo.sh
```

### Workflow 4: Debug Token Issues
```bash
# Check who owns a token
./queue_utils.sh owner 5

# Check if token is listed
./queue_utils.sh price 5

# Get contract details
./queue_utils.sh info
```

---

## 📋 Script Comparison

| Script | Deploys New Contract | Updates Frontend | Sets Up Demo | Use Case |
|--------|---------------------|------------------|--------------|----------|
| `reset_queue.sh` | ✅ Yes | ✅ Yes | ⚙️ Optional | Complete reset |
| `setup_demo.sh` | ❌ No | ❌ No | ✅ Yes | Add demo data |
| `queue_utils.sh` | ❌ No | ❌ No | ❌ No | Inspection only |

---

## 🔧 Technical Details

### What `reset_queue.sh` does behind the scenes:

1. **Build**: `stellar contract build`
2. **Deploy**: `stellar contract deploy --wasm ... --source alice`
3. **Initialize**: Calls `init_queue(admin_address)`
4. **Update Config**: Modifies `frontend/lib/stellar.ts` with new contract ID
5. **Backup**: Saves old config to `.backup` file
6. **Demo Setup** (if chosen):
   - Creates demo1-demo10 identities
   - Funds with friendbot
   - Calls `join_queue()` for each
   - Calls `list_for_sale()` for 6 positions

### Frontend Auto-Update

The reset script automatically updates:
```typescript
// In frontend/lib/stellar.ts
export const CONTRACT_ID = "NEW_CONTRACT_ID_HERE";
```

The old value is backed up to `stellar.ts.backup`

---

## 🎯 Best Practices

### Before Demo
1. Run `./reset_queue.sh` with demo data
2. Verify with `./queue_utils.sh status`
3. Check frontend shows correct data
4. Take screenshot for reference

### During Development
1. Use `./queue_utils.sh` for quick checks
2. Reset only when needed (keeps testnet clean)
3. Keep backup of `stellar.ts.backup` if needed

### After Testing
1. `./queue_utils.sh status` to document state
2. Reset before next demo session
3. Update documentation if contract changes

---

## 🐛 Troubleshooting

### Script Won't Run
```bash
# Make sure scripts are executable
chmod +x reset_queue.sh
chmod +x setup_demo.sh
chmod +x queue_utils.sh
```

### Contract Deployment Fails
```bash
# Check alice has funds
stellar keys address alice
# Fund if needed:
curl "https://friendbot.stellar.org/?addr=YOUR_ADDRESS"
```

### Frontend Not Updating
```bash
# Check if CONTRACT_ID was updated
grep CONTRACT_ID frontend/lib/stellar.ts

# Manually update if needed, then restart:
cd frontend
npm run dev
```

### Demo Users Already Exist
```bash
# Check if demo users exist
stellar keys address demo1

# They're reused, which is fine
# Script will fund and use existing ones
```

---

## 📁 File Locations

- **Scripts**: `/home/lkilic/StellarChallenge/`
  - `reset_queue.sh` - Main reset script
  - `setup_demo.sh` - Demo data setup
  - `queue_utils.sh` - Utility commands
  - `list_demo_tokens.sh` - (Auto-generated during reset)

- **Contract**: `/home/lkilic/StellarChallenge/contract/queue-contract/`
  - `target/wasm32v1-none/release/hello_world.wasm` - Compiled contract

- **Frontend Config**: `/home/lkilic/StellarChallenge/frontend/lib/stellar.ts`
  - Contains `CONTRACT_ID` that scripts update

- **Backups**: `/home/lkilic/StellarChallenge/frontend/lib/`
  - `stellar.ts.backup` - Created during reset

---

## 🎬 Quick Reference

```bash
# Complete reset with demo data
./reset_queue.sh

# Just add demo data to existing queue
./setup_demo.sh

# Check queue status
./queue_utils.sh status

# List all tokens
./queue_utils.sh list

# Check specific token
./queue_utils.sh owner 5
./queue_utils.sh price 5

# Show contract info
./queue_utils.sh info
```

---

## 💡 Pro Tips

1. **Before Every Demo**: Run `./reset_queue.sh` for consistency
2. **Quick Debug**: Use `./queue_utils.sh list` to see state
3. **Keep Backups**: The `.backup` file helps if something breaks
4. **Test First**: Run `./queue_utils.sh status` after reset
5. **Document**: Screenshot the demo setup for reference

---

**Happy Queue Managing! 🚀**

