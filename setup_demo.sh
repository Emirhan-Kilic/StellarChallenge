#!/bin/bash

# StellarSkip Demo Data Setup Script
# This script creates realistic demo data for presentations

set -e  # Exit on error

echo "🎬 StellarSkip Demo Data Setup"
echo "================================"
echo ""

cd /home/lkilic/StellarChallenge/contract/queue-contract

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Create demo users
echo -e "${BLUE}📝 Step 1: Creating 10 demo users...${NC}"
for i in {1..10}; do
  if stellar keys address demo$i 2>/dev/null; then
    echo -e "  ${YELLOW}⚠${NC}  demo$i already exists, skipping..."
  else
    stellar keys generate demo$i --network testnet 2>/dev/null
    echo -e "  ${GREEN}✓${NC} demo$i created"
  fi
done
echo ""

# 2. Fund users
echo -e "${BLUE}💰 Step 2: Funding demo users with testnet XLM...${NC}"
for i in {1..10}; do
  ADDRESS=$(stellar keys address demo$i)
  echo -e "  Funding demo$i (${ADDRESS:0:8}...)..."
  curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
  echo -e "  ${GREEN}✓${NC} demo$i funded"
  sleep 2  # Be nice to friendbot
done
echo ""

# 3. Join queue
echo -e "${BLUE}🎫 Step 3: Joining queue (this may take a minute)...${NC}"
for i in {1..10}; do
  echo -e "  demo$i joining queue..."
  RESULT=$(stellar contract invoke \
    --id queue_contract \
    --source demo$i \
    --network testnet \
    -- join_queue \
    --user $(stellar keys address demo$i) 2>&1)
  
  if echo "$RESULT" | grep -q "Error\|error\|failed"; then
    echo -e "  ${YELLOW}⚠${NC}  demo$i may have already joined or error occurred"
  else
    echo -e "  ${GREEN}✓${NC} demo$i joined as position #$((i-1))"
  fi
  sleep 1
done
echo ""

# 4. List tokens for sale
echo -e "${BLUE}💵 Step 4: Listing select tokens for sale...${NC}"

# Position #1 - 10 XLM
echo -e "  Listing position #1 for 10 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo2 \
  --network testnet \
  -- list_for_sale \
  --token_id 1 \
  --price 100000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #1 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #1: 10 XLM (Premium spot!)"

# Position #2 - 8 XLM
echo -e "  Listing position #2 for 8 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo3 \
  --network testnet \
  -- list_for_sale \
  --token_id 2 \
  --price 80000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #2 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #2: 8 XLM (Great position)"

# Position #4 - 6 XLM
echo -e "  Listing position #4 for 6 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo5 \
  --network testnet \
  -- list_for_sale \
  --token_id 4 \
  --price 60000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #4 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #4: 6 XLM (Mid-queue)"

# Position #5 - 5.5 XLM
echo -e "  Listing position #5 for 5.5 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo6 \
  --network testnet \
  -- list_for_sale \
  --token_id 5 \
  --price 55000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #5 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #5: 5.5 XLM (Mid-queue)"

# Position #7 - 3.5 XLM
echo -e "  Listing position #7 for 3.5 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo8 \
  --network testnet \
  -- list_for_sale \
  --token_id 7 \
  --price 35000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #7 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #7: 3.5 XLM (Back half)"

# Position #9 - 2 XLM
echo -e "  Listing position #9 for 2 XLM..."
stellar contract invoke \
  --id queue_contract \
  --source demo10 \
  --network testnet \
  -- list_for_sale \
  --token_id 9 \
  --price 20000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #9 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #9: 2 XLM (Bargain!)"

echo ""
echo -e "${GREEN}✨ Demo setup complete!${NC}"
echo ""
echo "📊 Demo Queue Status:"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  │ Position │ Owner │ Status      │ Price (XLM) │"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  │    #0    │ demo1 │ Not Listed  │      -      │"
echo "  │    #1    │ demo2 │ FOR SALE 💰 │    10.0     │"
echo "  │    #2    │ demo3 │ FOR SALE 💰 │     8.0     │"
echo "  │    #3    │ demo4 │ Not Listed  │      -      │"
echo "  │    #4    │ demo5 │ FOR SALE 💰 │     6.0     │"
echo "  │    #5    │ demo6 │ FOR SALE 💰 │     5.5     │"
echo "  │    #6    │ demo7 │ Not Listed  │      -      │"
echo "  │    #7    │ demo8 │ FOR SALE 💰 │     3.5     │"
echo "  │    #8    │ demo9 │ Not Listed  │      -      │"
echo "  │    #9    │ demo10│ FOR SALE 💰 │     2.0     │"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📈 Market Summary:"
echo "  • Total positions: 10"
echo "  • Listed for sale: 6"
echo "  • Not for sale: 4"
echo "  • Price range: 2-10 XLM"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. cd /home/lkilic/StellarChallenge/frontend"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000"
echo "  4. Connect your Freighter wallet"
echo "  5. Start your demo presentation!"
echo ""
echo -e "${GREEN}Happy demoing! 🎉${NC}"

