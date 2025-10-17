#!/bin/bash

# StellarSkip Queue Reset Script
# This script deploys a fresh contract and optionally sets up demo data

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   StellarSkip Queue Reset Script      ║${NC}"
echo -e "${BLUE}║   (Multi-Queue Support)                ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "/home/lkilic/StellarChallenge/contract/queue-contract" ]; then
    echo -e "${RED}❌ Error: Contract directory not found${NC}"
    echo "Please run this script from /home/lkilic/StellarChallenge"
    exit 1
fi

# Step 1: Build the contract
echo -e "${BLUE}📦 Step 1: Building smart contract...${NC}"
cd /home/lkilic/StellarChallenge/contract/queue-contract
stellar contract build > /dev/null 2>&1
echo -e "${GREEN}✅ Contract built successfully${NC}"
echo ""

# Step 2: Deploy new contract
echo -e "${BLUE}🚀 Step 2: Deploying fresh contract to Testnet...${NC}"
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source alice \
  --network testnet 2>&1 | tail -1)

if [ -z "$CONTRACT_ID" ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed!${NC}"
echo -e "   Contract ID: ${YELLOW}${CONTRACT_ID}${NC}"
echo ""

# Step 3: Initialize contract
echo -e "${BLUE}🔧 Step 3: Initializing contract...${NC}"
ADMIN_ADDRESS=$(stellar keys address alice)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- init_contract \
  --admin $ADMIN_ADDRESS > /dev/null 2>&1

echo -e "${GREEN}✅ Contract initialized${NC}"
echo -e "   Admin: ${YELLOW}${ADMIN_ADDRESS}${NC}"
echo ""

# Step 4: Update frontend configuration
echo -e "${BLUE}📝 Step 4: Updating frontend configuration...${NC}"

# Backup old config
FRONTEND_CONFIG="/home/lkilic/StellarChallenge/frontend/lib/stellar.ts"
cp $FRONTEND_CONFIG ${FRONTEND_CONFIG}.backup

# Update CONTRACT_ID in stellar.ts
sed -i "s/export const CONTRACT_ID = \".*\"/export const CONTRACT_ID = \"${CONTRACT_ID}\"/" $FRONTEND_CONFIG

echo -e "${GREEN}✅ Frontend updated${NC}"
echo -e "   Backup saved: ${FRONTEND_CONFIG}.backup"
echo ""

# Step 5: Verify deployment
echo -e "${BLUE}🔍 Step 5: Verifying deployment...${NC}"
QUEUE_COUNT=$(stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- get_queue_count 2>&1 | tail -1)

if [ "$QUEUE_COUNT" = "0" ]; then
    echo -e "${GREEN}✅ Verification passed - No queues yet${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Contract has $QUEUE_COUNT queues${NC}"
fi
echo ""

# Step 6: Ask about demo data
echo -e "${BLUE}🎬 Step 6: Demo data setup${NC}"
echo ""
read -p "Do you want to set up demo data with multiple queues? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Setting up demo data...${NC}"
    echo ""
    
    # Create 3 demo queues
    echo -e "${BLUE}📋 Creating demo queues...${NC}"
    
    echo -e "  Creating 'Coffee Shop Morning Rush'..."
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Coffee Shop Morning Rush" --creator $ADMIN_ADDRESS > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Queue #0 created"
    
    echo -e "  Creating 'Theme Park Fast Pass'..."
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Theme Park Fast Pass" --creator $ADMIN_ADDRESS > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Queue #1 created"
    
    echo -e "  Creating 'Concert VIP Entry'..."
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Concert VIP Entry" --creator $ADMIN_ADDRESS > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Queue #2 created"
    echo ""
    
    # Create demo users if they don't exist
    echo -e "${BLUE}👥 Creating demo users...${NC}"
    for user in bob carol dave; do
        if ! stellar keys address $user > /dev/null 2>&1; then
            stellar keys generate $user --network testnet > /dev/null 2>&1
            echo -e "  ${GREEN}✓${NC} $user created"
        else
            echo -e "  ${YELLOW}→${NC} $user exists"
        fi
    done
    echo ""
    
    # Fund demo users
    echo -e "${BLUE}💰 Funding demo users...${NC}"
    for user in bob carol dave; do
        ADDRESS=$(stellar keys address $user)
        curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
        echo -e "  ${GREEN}✓${NC} $user funded"
        sleep 2
    done
    echo ""
    
    # Join Coffee Shop queue (Queue #0)
    echo -e "${BLUE}☕ Populating Coffee Shop queue...${NC}"
    for user in bob carol dave alice; do
        stellar contract invoke --id $CONTRACT_ID --source $user --network testnet \
          -- join_queue --queue_id 0 --user $(stellar keys address $user) > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} $user joined Coffee Shop"
        sleep 1
    done
    echo ""
    
    # Join Theme Park queue (Queue #1)
    echo -e "${BLUE}🎢 Populating Theme Park queue...${NC}"
    for user in bob carol; do
        stellar contract invoke --id $CONTRACT_ID --source $user --network testnet \
          -- join_queue --queue_id 1 --user $(stellar keys address $user) > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} $user joined Theme Park"
        sleep 1
    done
    echo ""
    
    # Join Concert queue (Queue #2)
    echo -e "${BLUE}🎵 Populating Concert queue...${NC}"
    stellar contract invoke --id $CONTRACT_ID --source dave --network testnet \
      -- join_queue --queue_id 2 --user $(stellar keys address dave) > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} dave joined Concert"
    echo ""
    
    # List tokens for sale
    echo -e "${BLUE}💵 Listing tokens for sale...${NC}"
    
    # Coffee Shop Queue #0
    stellar contract invoke --id $CONTRACT_ID --source bob --network testnet \
      -- list_for_sale --queue_id 0 --token_id 0 --price 30000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Coffee Shop #0 (Bob): 3 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source carol --network testnet \
      -- list_for_sale --queue_id 0 --token_id 1 --price 50000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Coffee Shop #1 (Carol): 5 XLM"
    
    # Theme Park Queue #1
    stellar contract invoke --id $CONTRACT_ID --source bob --network testnet \
      -- list_for_sale --queue_id 1 --token_id 0 --price 1000000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Theme Park #0 (Bob): 100 XLM"
    
    echo ""
    echo -e "${GREEN}✨ Demo data setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📊 Demo Summary:${NC}"
    echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  ${YELLOW}Queue #0: Coffee Shop Morning Rush${NC}"
    echo -e "    • 4 members (Bob, Carol, Dave, Alice)"
    echo -e "    • 2 tokens for sale (3 XLM, 5 XLM)"
    echo ""
    echo -e "  ${YELLOW}Queue #1: Theme Park Fast Pass${NC}"
    echo -e "    • 2 members (Bob, Carol)"
    echo -e "    • 1 token for sale (100 XLM)"
    echo ""
    echo -e "  ${YELLOW}Queue #2: Concert VIP Entry${NC}"
    echo -e "    • 1 member (Dave)"
    echo -e "    • Not for sale"
    echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Reset Complete! ✨             ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  Contract ID: ${YELLOW}${CONTRACT_ID}${NC}"
echo -e "  Network: ${YELLOW}Stellar Testnet${NC}"
FINAL_QUEUE_COUNT=$(stellar contract invoke --id $CONTRACT_ID --source alice --network testnet -- get_queue_count 2>&1 | tail -1)
echo -e "  Total Queues: ${YELLOW}${FINAL_QUEUE_COUNT}${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd /home/lkilic/StellarChallenge/frontend"
echo -e "  2. npm run dev"
echo -e "  3. Open ${YELLOW}http://localhost:3000${NC}"
echo -e "  4. ${GREEN}Explore multiple queues!${NC}"
echo ""
echo -e "${BLUE}📌 Contract Explorer:${NC}"
echo -e "  https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}"
echo ""
echo -e "${BLUE}💾 Backup:${NC}"
echo -e "  Old config saved to: ${FRONTEND_CONFIG}.backup"
echo ""
