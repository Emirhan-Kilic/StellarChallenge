#!/bin/bash

# StellarSkip Demo Data Setup Script (Multi-Queue Support)
# This script creates realistic demo data for presentations

set -e  # Exit on error

echo "🎬 StellarSkip Demo Data Setup (Multi-Queue)"
echo "=============================================="
echo ""

cd /home/lkilic/StellarChallenge/contract/queue-contract

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Get contract ID from frontend config
CONTRACT_ID=$(grep 'export const CONTRACT_ID' /home/lkilic/StellarChallenge/frontend/lib/stellar.ts | sed 's/.*"\(.*\)".*/\1/')

if [ -z "$CONTRACT_ID" ]; then
    echo -e "${RED}❌ Could not find contract ID in frontend config${NC}"
    echo "Please run ./reset_queue.sh first to deploy the contract"
    exit 1
fi

echo -e "${BLUE}Using contract: ${YELLOW}${CONTRACT_ID}${NC}"
echo ""

# 1. Check if queues exist, if not create them
echo -e "${BLUE}📋 Step 1: Checking/Creating queues...${NC}"

QUEUE_COUNT=$(stellar contract invoke \
    --id $CONTRACT_ID \
    --source alice \
    --network testnet \
    -- get_queue_count 2>&1 | tail -1)

if [ "$QUEUE_COUNT" -eq 0 ]; then
    echo -e "  ${YELLOW}No queues found. Creating demo queues...${NC}"
    
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Coffee Shop Morning Rush" --creator $(stellar keys address alice) > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Created: Coffee Shop Morning Rush (Queue #0)"
    
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Theme Park Fast Pass" --creator $(stellar keys address alice) > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Created: Theme Park Fast Pass (Queue #1)"
    
    stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
      -- create_queue --name "Concert VIP Entry" --creator $(stellar keys address alice) > /dev/null 2>&1
    echo -e "  ${GREEN}✓${NC} Created: Concert VIP Entry (Queue #2)"
else
    echo -e "  ${GREEN}✓${NC} Found $QUEUE_COUNT existing queues"
fi
echo ""

# 2. Create demo users
echo -e "${BLUE}📝 Step 2: Creating demo users...${NC}"
for user in bob carol dave; do
  if stellar keys address $user 2>/dev/null > /dev/null; then
    echo -e "  ${YELLOW}→${NC} $user already exists, skipping..."
  else
    stellar keys generate $user --network testnet 2>/dev/null
    echo -e "  ${GREEN}✓${NC} $user created"
  fi
done
echo ""

# 3. Fund users
echo -e "${BLUE}💰 Step 3: Funding demo users with testnet XLM...${NC}"
for user in bob carol dave; do
  ADDRESS=$(stellar keys address $user)
  echo -e "  Funding $user (${ADDRESS:0:8}...)..."
  curl -s "https://friendbot.stellar.org/?addr=$ADDRESS" > /dev/null
  echo -e "  ${GREEN}✓${NC} $user funded"
  sleep 2  # Be nice to friendbot
done
echo ""

# 4. Join Coffee Shop queue (Queue #0)
echo -e "${BLUE}☕ Step 4: Joining Coffee Shop queue...${NC}"
for user in bob carol dave alice; do
  echo -e "  $user joining Coffee Shop..."
  RESULT=$(stellar contract invoke \
    --id $CONTRACT_ID \
    --source $user \
    --network testnet \
    -- join_queue \
    --queue_id 0 \
    --user $(stellar keys address $user) 2>&1 | tail -1)
  
  if echo "$RESULT" | grep -qE '^[0-9]+$'; then
    echo -e "  ${GREEN}✓${NC} $user joined as position #$RESULT"
  else
    echo -e "  ${YELLOW}⚠${NC}  $user may have already joined"
  fi
  sleep 1
done
echo ""

# 5. Join Theme Park queue (Queue #1)
echo -e "${BLUE}🎢 Step 5: Joining Theme Park queue...${NC}"
for user in bob carol; do
  echo -e "  $user joining Theme Park..."
  RESULT=$(stellar contract invoke \
    --id $CONTRACT_ID \
    --source $user \
    --network testnet \
    -- join_queue \
    --queue_id 1 \
    --user $(stellar keys address $user) 2>&1 | tail -1)
  
  if echo "$RESULT" | grep -qE '^[0-9]+$'; then
    echo -e "  ${GREEN}✓${NC} $user joined as position #$RESULT"
  else
    echo -e "  ${YELLOW}⚠${NC}  $user may have already joined"
  fi
  sleep 1
done
echo ""

# 6. Join Concert queue (Queue #2)
echo -e "${BLUE}🎵 Step 6: Joining Concert queue...${NC}"
echo -e "  dave joining Concert..."
RESULT=$(stellar contract invoke \
  --id $CONTRACT_ID \
  --source dave \
  --network testnet \
  -- join_queue \
  --queue_id 2 \
  --user $(stellar keys address dave) 2>&1 | tail -1)

if echo "$RESULT" | grep -qE '^[0-9]+$'; then
  echo -e "  ${GREEN}✓${NC} dave joined as position #$RESULT"
else
  echo -e "  ${YELLOW}⚠${NC}  dave may have already joined"
fi
echo ""

# 7. List tokens for sale
echo -e "${BLUE}💵 Step 7: Listing select tokens for sale...${NC}"

# Coffee Shop Queue #0
echo -e "  ${PURPLE}Coffee Shop Queue:${NC}"
stellar contract invoke \
  --id $CONTRACT_ID \
  --source bob \
  --network testnet \
  -- list_for_sale \
  --queue_id 0 \
  --token_id 0 \
  --price 30000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #0 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #0 (Bob): 3 XLM"

stellar contract invoke \
  --id $CONTRACT_ID \
  --source carol \
  --network testnet \
  -- list_for_sale \
  --queue_id 0 \
  --token_id 1 \
  --price 50000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #1 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #1 (Carol): 5 XLM"

# Theme Park Queue #1
echo -e "  ${PURPLE}Theme Park Queue:${NC}"
stellar contract invoke \
  --id $CONTRACT_ID \
  --source bob \
  --network testnet \
  -- list_for_sale \
  --queue_id 1 \
  --token_id 0 \
  --price 1000000000 > /dev/null 2>&1 || echo -e "  ${YELLOW}⚠${NC}  Position #0 may already be listed"
echo -e "  ${GREEN}✓${NC} Position #0 (Bob): 100 XLM"

echo ""
echo -e "${GREEN}✨ Demo setup complete!${NC}"
echo ""
echo "📊 Demo Queue Summary:"
echo -e "  ${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${PURPLE}☕ Queue #0: Coffee Shop Morning Rush${NC}"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │ Position │ Owner  │ Status       │ Price (XLM) │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │    #0    │ bob    │ ${GREEN}FOR SALE 💰${NC}  │     3.0     │"
echo -e "  │    #1    │ carol  │ ${GREEN}FOR SALE 💰${NC}  │     5.0     │"
echo -e "  │    #2    │ dave   │ Not Listed   │      -      │"
echo -e "  │    #3    │ alice  │ Not Listed   │      -      │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${PURPLE}🎢 Queue #1: Theme Park Fast Pass${NC}"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │ Position │ Owner  │ Status       │ Price (XLM) │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │    #0    │ bob    │ ${GREEN}FOR SALE 💰${NC}  │    100.0    │"
echo -e "  │    #1    │ carol  │ Not Listed   │      -      │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${PURPLE}🎵 Queue #2: Concert VIP Entry${NC}"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │ Position │ Owner  │ Status       │ Price (XLM) │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  │    #0    │ dave   │ Not Listed   │      -      │"
echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📈 Market Summary:"
echo "  • Total queues: 3"
echo "  • Total positions: 7"
echo "  • Listed for sale: 3"
echo "  • Price range: 3-100 XLM"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. cd /home/lkilic/StellarChallenge/frontend"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000"
echo "  4. Connect your Freighter wallet"
echo "  5. Explore multiple queues!"
echo ""
echo -e "${BLUE}💡 Try These Commands:${NC}"
echo "  ./queue_utils.sh queues      # List all queues"
echo "  ./queue_utils.sh status 0    # Coffee Shop status"
echo "  ./queue_utils.sh list 0      # List Coffee Shop tokens"
echo "  ./queue_utils.sh owner 0 1   # Check owner of position #1"
echo ""
echo -e "${GREEN}Happy demoing! 🎉${NC}"
