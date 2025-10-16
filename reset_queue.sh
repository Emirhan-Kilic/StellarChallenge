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
  -- init_queue \
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
TOKEN_COUNT=$(stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- get_next_token_id 2>&1 | grep -o '"[0-9]*"' | tr -d '"')

if [ "$TOKEN_COUNT" = "0" ]; then
    echo -e "${GREEN}✅ Verification passed - Queue is empty${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Queue has $TOKEN_COUNT tokens${NC}"
fi
echo ""

# Step 6: Ask about demo data
echo -e "${BLUE}🎬 Step 6: Demo data setup${NC}"
echo ""
read -p "Do you want to set up demo data (10 users with realistic prices)? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Setting up demo data...${NC}"
    echo ""
    
    # Create demo users if they don't exist
    echo -e "Creating demo users..."
    for i in {1..10}; do
        if ! stellar keys address demo$i > /dev/null 2>&1; then
            stellar keys generate demo$i --network testnet > /dev/null 2>&1
            echo -e "  ${GREEN}✓${NC} demo$i created"
        else
            echo -e "  ${YELLOW}→${NC} demo$i exists"
        fi
    done
    echo ""
    
    # Fund demo users
    echo -e "Funding demo users..."
    for i in {1..10}; do
        ADDRESS=$(stellar keys address demo$i)
        curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
        echo -e "  ${GREEN}✓${NC} demo$i funded"
        sleep 2
    done
    echo ""
    
    # Join queue
    echo -e "Joining queue..."
    for i in {1..10}; do
        stellar contract invoke \
          --id $CONTRACT_ID \
          --source demo$i \
          --network testnet \
          -- join_queue \
          --user $(stellar keys address demo$i) > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} demo$i joined as position #$((i-1))"
        sleep 1
    done
    echo ""
    
    # List tokens for sale
    echo -e "Listing tokens for sale..."
    
    stellar contract invoke --id $CONTRACT_ID --source demo2 --network testnet -- list_for_sale --token_id 1 --price 100000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #1: 10 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source demo3 --network testnet -- list_for_sale --token_id 2 --price 80000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #2: 8 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source demo5 --network testnet -- list_for_sale --token_id 4 --price 60000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #4: 6 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source demo6 --network testnet -- list_for_sale --token_id 5 --price 55000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #5: 5.5 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source demo8 --network testnet -- list_for_sale --token_id 7 --price 35000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #7: 3.5 XLM"
    
    stellar contract invoke --id $CONTRACT_ID --source demo10 --network testnet -- list_for_sale --token_id 9 --price 20000000 > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Position #9: 2 XLM"
    
    echo ""
    echo -e "${GREEN}✨ Demo data setup complete!${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Reset Complete! ✨             ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  Contract ID: ${YELLOW}${CONTRACT_ID}${NC}"
echo -e "  Network: ${YELLOW}Stellar Testnet${NC}"
echo -e "  Queue Size: ${YELLOW}$(stellar contract invoke --id $CONTRACT_ID --source alice --network testnet -- get_next_token_id 2>&1 | grep -o '"[0-9]*"' | tr -d '"')${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd /home/lkilic/StellarChallenge/frontend"
echo -e "  2. npm run dev"
echo -e "  3. Open ${YELLOW}http://localhost:3000${NC}"
echo -e "  4. ${GREEN}Start your demo!${NC}"
echo ""
echo -e "${BLUE}📌 Contract Explorer:${NC}"
echo -e "  https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}"
echo ""
echo -e "${BLUE}💾 Backup:${NC}"
echo -e "  Old config saved to: ${FRONTEND_CONFIG}.backup"
echo ""

