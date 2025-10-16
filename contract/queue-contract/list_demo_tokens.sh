#!/bin/bash
# List tokens owned by demo users (positions 11-20)

echo "Listing demo tokens for sale..."

# demo2 owns token #12 - list for 10 XLM
stellar contract invoke --id queue_contract --source demo2 --network testnet -- list_for_sale --token_id 12 --price 100000000
echo "✓ Token #12 listed for 10 XLM"

# demo3 owns token #13 - list for 8 XLM  
stellar contract invoke --id queue_contract --source demo3 --network testnet -- list_for_sale --token_id 13 --price 80000000
echo "✓ Token #13 listed for 8 XLM"

# demo5 owns token #15 - list for 6 XLM
stellar contract invoke --id queue_contract --source demo5 --network testnet -- list_for_sale --token_id 15 --price 60000000
echo "✓ Token #15 listed for 6 XLM"

# demo6 owns token #16 - list for 5.5 XLM
stellar contract invoke --id queue_contract --source demo6 --network testnet -- list_for_sale --token_id 16 --price 55000000
echo "✓ Token #16 listed for 5.5 XLM"

# demo8 owns token #18 - list for 3.5 XLM
stellar contract invoke --id queue_contract --source demo8 --network testnet -- list_for_sale --token_id 18 --price 35000000
echo "✓ Token #18 listed for 3.5 XLM"

# demo10 owns token #20 - list for 2 XLM
stellar contract invoke --id queue_contract --source demo10 --network testnet -- list_for_sale --token_id 20 --price 20000000
echo "✓ Token #20 listed for 2 XLM"

echo ""
echo "✨ Demo tokens listed successfully!"
