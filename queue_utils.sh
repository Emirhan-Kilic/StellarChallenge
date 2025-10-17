#!/bin/bash

# StellarSkip Queue Utilities (Multi-Queue Support)
# Common operations for queue management

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
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
    echo -e "${BLUE}║   (Multi-Queue Support)                ║${NC}"
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo ""
    echo "Usage: ./queue_utils.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  queues                  List all queues"
    echo "  status [queue_id]       Show queue status (all or specific)"
    echo "  list <queue_id>         List all tokens in a queue"
    echo "  owner <queue_id> <id>   Get owner of token"
    echo "  price <queue_id> <id>   Get price of token"
    echo "  info                    Show contract information"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./queue_utils.sh queues"
    echo "  ./queue_utils.sh status 0"
    echo "  ./queue_utils.sh list 0"
    echo "  ./queue_utils.sh owner 0 5"
    echo "  ./queue_utils.sh price 1 3"
    echo ""
}

# Function to list all queues
list_queues() {
    echo -e "${BLUE}📋 All Queues${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    TOTAL_QUEUES=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_count 2>&1 | tail -1)
    
    if [ "$TOTAL_QUEUES" -eq 0 ]; then
        echo -e "${YELLOW}No queues created yet${NC}"
        return
    fi
    
    echo -e "ID  | Queue Name                    | Tokens"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for ((i=0; i<$TOTAL_QUEUES; i++)); do
        NAME=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_queue_name \
            --queue_id $i 2>&1 | grep -o '"[^"]*"' | tr -d '"')
        
        TOKEN_COUNT=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_next_token_id \
            --queue_id $i 2>&1 | tail -1)
        
        echo -e "${PURPLE}#$i${NC}  | ${YELLOW}$NAME${NC} | $TOKEN_COUNT"
    done
    echo ""
}

# Function to get queue status
queue_status() {
    QUEUE_ID=$1
    
    if [ -z "$QUEUE_ID" ]; then
        # Show status for all queues
        TOTAL_QUEUES=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_queue_count 2>&1 | tail -1)
        
        echo -e "${BLUE}📊 All Queues Status${NC}"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "Total Queues: ${YELLOW}${TOTAL_QUEUES}${NC}"
        echo ""
        
        if [ "$TOTAL_QUEUES" -eq 0 ]; then
            echo -e "${GREEN}No queues exist yet${NC}"
            return
        fi
        
        for ((i=0; i<$TOTAL_QUEUES; i++)); do
            echo -e "${PURPLE}━━━ Queue #$i ━━━${NC}"
            queue_status $i
            echo ""
        done
        return
    fi
    
    # Show status for specific queue
    NAME=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_name \
        --queue_id $QUEUE_ID 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    if [ -z "$NAME" ]; then
        echo -e "${RED}❌ Queue #$QUEUE_ID not found${NC}"
        return
    fi
    
    TOTAL=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_next_token_id \
        --queue_id $QUEUE_ID 2>&1 | tail -1)
    
    echo -e "Queue Name: ${YELLOW}${NAME}${NC}"
    echo -e "Total Tokens: ${YELLOW}${TOTAL}${NC}"
    
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
            --queue_id $QUEUE_ID \
            --token_id $i 2>&1 | tail -1 | grep -o '[0-9]*')
        
        if [ ! -z "$PRICE" ] && [ "$PRICE" != "0" ]; then
            ((FOR_SALE++))
        fi
    done
    
    echo -e "For Sale: ${YELLOW}${FOR_SALE}${NC}"
    echo -e "Not For Sale: ${YELLOW}$((TOTAL - FOR_SALE))${NC}"
}

# Function to list all tokens in a queue
list_tokens() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide queue ID${NC}"
        echo "Usage: ./queue_utils.sh list <queue_id>"
        exit 1
    fi
    
    QUEUE_ID=$1
    
    NAME=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_name \
        --queue_id $QUEUE_ID 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    if [ -z "$NAME" ]; then
        echo -e "${RED}❌ Queue #$QUEUE_ID not found${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📋 Token List - Queue #${QUEUE_ID}: ${NAME}${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    TOTAL=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_next_token_id \
        --queue_id $QUEUE_ID 2>&1 | tail -1)
    
    if [ "$TOTAL" -eq 0 ]; then
        echo -e "${YELLOW}Queue is empty${NC}"
        return
    fi
    
    echo -e "Pos | Owner (truncated)     | Price (XLM) | Status"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for ((i=0; i<$TOTAL; i++)); do
        OWNER=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- owner_of \
            --queue_id $QUEUE_ID \
            --token_id $i 2>&1 | grep -o '"[^"]*"' | tr -d '"')
        
        PRICE=$(stellar contract invoke \
            --id $CONTRACT_ID \
            --source alice \
            --network testnet \
            -- get_price \
            --queue_id $QUEUE_ID \
            --token_id $i 2>&1 | tail -1 | grep -o '[0-9]*')
        
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
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}❌ Please provide queue ID and token ID${NC}"
        echo "Usage: ./queue_utils.sh owner <queue_id> <token_id>"
        exit 1
    fi
    
    QUEUE_ID=$1
    TOKEN_ID=$2
    
    echo -e "${BLUE}👤 Token Owner${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    OWNER=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- owner_of \
        --queue_id $QUEUE_ID \
        --token_id $TOKEN_ID 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    if [ -z "$OWNER" ]; then
        echo -e "${RED}❌ Token not found${NC}"
        exit 1
    fi
    
    NAME=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_name \
        --queue_id $QUEUE_ID 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    echo -e "Queue: ${YELLOW}#${QUEUE_ID} - ${NAME}${NC}"
    echo -e "Token ID: ${YELLOW}#${TOKEN_ID}${NC}"
    echo -e "Owner: ${YELLOW}${OWNER}${NC}"
}

# Function to get price
get_price() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}❌ Please provide queue ID and token ID${NC}"
        echo "Usage: ./queue_utils.sh price <queue_id> <token_id>"
        exit 1
    fi
    
    QUEUE_ID=$1
    TOKEN_ID=$2
    
    echo -e "${BLUE}💰 Token Price${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    PRICE=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_price \
        --queue_id $QUEUE_ID \
        --token_id $TOKEN_ID 2>&1 | tail -1 | grep -o '[0-9]*')
    
    NAME=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_name \
        --queue_id $QUEUE_ID 2>&1 | grep -o '"[^"]*"' | tr -d '"')
    
    echo -e "Queue: ${YELLOW}#${QUEUE_ID} - ${NAME}${NC}"
    echo -e "Token ID: ${YELLOW}#${TOKEN_ID}${NC}"
    
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
    
    TOTAL_QUEUES=$(stellar contract invoke \
        --id $CONTRACT_ID \
        --source alice \
        --network testnet \
        -- get_queue_count 2>&1 | tail -1)
    echo -e "Total Queues: ${YELLOW}${TOTAL_QUEUES}${NC}"
    echo ""
    echo -e "Explorer:"
    echo -e "  ${BLUE}https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}${NC}"
    echo ""
    echo -e "Frontend Config:"
    echo -e "  ${YELLOW}/home/lkilic/StellarChallenge/frontend/lib/stellar.ts${NC}"
}

# Main script logic
case "$1" in
    queues)
        list_queues
        ;;
    status)
        queue_status "$2"
        ;;
    list)
        list_tokens "$2"
        ;;
    owner)
        get_owner "$2" "$3"
        ;;
    price)
        get_price "$2" "$3"
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
