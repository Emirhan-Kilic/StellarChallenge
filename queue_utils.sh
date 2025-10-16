#!/bin/bash

# StellarSkip Queue Utilities
# Common operations for queue management

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get contract ID from frontend config
CONTRACT_ID=$(grep 'export const CONTRACT_ID' /home/lkilic/StellarChallenge/frontend/lib/stellar.ts | sed 's/.*"\(.*\)".*/\1/')

if [ -z "$CONTRACT_ID" ]; then
    echo -e "${RED}❌ Could not find contract ID in frontend config${NC}"
    exit 1
fi

# Function to show help
show_help() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   StellarSkip Queue Utilities         ║${NC}"
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo ""
    echo "Usage: ./queue_utils.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status          Show current queue status"
    echo "  list            List all tokens in queue"
    echo "  owner <id>      Get owner of token ID"
    echo "  price <id>      Get price of token ID"
    echo "  info            Show contract information"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./queue_utils.sh status"
    echo "  ./queue_utils.sh owner 5"
    echo "  ./queue_utils.sh price 3"
    echo ""
}

# Function to get queue status
queue_status() {
    echo -e "${BLUE}📊 Queue Status${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    TOTAL=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_next_token_id 2>&1 | grep -o '"[0-9]*"' | tr -d '"')
    
    echo -e "Contract ID: ${YELLOW}${CONTRACT_ID}${NC}"
    echo -e "Total Tokens: ${YELLOW}${TOTAL}${NC}"
    echo ""
    
    if [ "$TOTAL" -eq 0 ]; then
        echo -e "${GREEN}Queue is empty${NC}"
        return
    fi
    
    # Count tokens for sale
    FOR_SALE=0
    for ((i=0; i<$TOTAL; i++)); do
        PRICE=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_price \
            --token_id $i 2>&1 | grep -o '"[0-9]*"' | tr -d '"')
        
        if [ ! -z "$PRICE" ] && [ "$PRICE" != "0" ]; then
            ((FOR_SALE++))
        fi
    done
    
    echo -e "For Sale: ${YELLOW}${FOR_SALE}${NC}"
    echo -e "Not For Sale: ${YELLOW}$((TOTAL - FOR_SALE))${NC}"
}

# Function to list all tokens
list_tokens() {
    echo -e "${BLUE}📋 Token List${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    TOTAL=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_next_token_id 2>&1 | grep -o '"[0-9]*"' | tr -d '"')
    
    if [ "$TOTAL" -eq 0 ]; then
        echo -e "${YELLOW}Queue is empty${NC}"
        return
    fi
    
    echo -e "Pos | Owner (truncated)  | Price (XLM) | Status"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for ((i=0; i<$TOTAL; i++)); do
        OWNER=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- owner_of \
            --token_id $i 2>&1 | grep -o '"[^"]*"' | tr -d '"')
        
        PRICE=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_price \
            --token_id $i 2>&1 | grep -o '"[0-9]*"' | tr -d '"')
        
        OWNER_SHORT="${OWNER:0:8}...${OWNER: -4}"
        
        if [ ! -z "$PRICE" ] && [ "$PRICE" != "0" ]; then
            PRICE_XLM=$(echo "scale=2; $PRICE / 10000000" | bc)
            echo -e "#$i  | $OWNER_SHORT | ${GREEN}${PRICE_XLM}${NC}      | ${GREEN}FOR SALE${NC}"
        else
            echo -e "#$i  | $OWNER_SHORT | -           | Not Listed"
        fi
    done
}

# Function to get owner
get_owner() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide token ID${NC}"
        echo "Usage: ./queue_utils.sh owner <token_id>"
        exit 1
    fi
    
    echo -e "${BLUE}👤 Token Owner${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    OWNER=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- owner_of \
        --token_id $1 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    if [ -z "$OWNER" ]; then
        echo -e "${RED}❌ Token #$1 not found${NC}"
        exit 1
    fi
    
    echo -e "Token ID: ${YELLOW}#$1${NC}"
    echo -e "Owner: ${YELLOW}${OWNER}${NC}"
}

# Function to get price
get_price() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide token ID${NC}"
        echo "Usage: ./queue_utils.sh price <token_id>"
        exit 1
    fi
    
    echo -e "${BLUE}💰 Token Price${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    PRICE=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_price \
        --token_id $1 2>&1 | grep -o '"[0-9]*"' | tr -d '"')
    
    echo -e "Token ID: ${YELLOW}#$1${NC}"
    
    if [ ! -z "$PRICE" ] && [ "$PRICE" != "0" ]; then
        PRICE_XLM=$(echo "scale=2; $PRICE / 10000000" | bc)
        echo -e "Price: ${GREEN}${PRICE_XLM} XLM${NC}"
        echo -e "Status: ${GREEN}FOR SALE${NC}"
    else
        echo -e "Price: ${YELLOW}Not for sale${NC}"
        echo -e "Status: ${YELLOW}Not Listed${NC}"
    fi
}

# Function to show contract info
show_info() {
    echo -e "${BLUE}ℹ️  Contract Information${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Contract ID: ${YELLOW}${CONTRACT_ID}${NC}"
    echo -e "Network: ${YELLOW}Stellar Testnet${NC}"
    echo -e "RPC: ${YELLOW}https://soroban-testnet.stellar.org:443${NC}"
    echo ""
    echo -e "Explorer:"
    echo -e "  ${BLUE}https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}${NC}"
    echo ""
    echo -e "Frontend Config:"
    echo -e "  ${YELLOW}/home/lkilic/StellarChallenge/frontend/lib/stellar.ts${NC}"
}

# Main script logic
case "$1" in
    status)
        queue_status
        ;;
    list)
        list_tokens
        ;;
    owner)
        get_owner "$2"
        ;;
    price)
        get_price "$2"
        ;;
    info)
        show_info
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

