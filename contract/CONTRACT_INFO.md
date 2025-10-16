# Queue Contract Information

## Testnet Deployment

- **Contract ID**: `CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE`
- **Network**: Stellar Testnet
- **Admin**: `GCNLH47UZNAHQYBGSHF66HOAF23ZCPP6ULZJN3BKT6YLTMJJWCNYLE3Q`
- **Deployment Explorer**: https://stellar.expert/explorer/testnet/contract/CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE

## Contract Functions

1. `init_queue(admin: Address)` - Initialize the queue
2. `join_queue(user: Address)` - Join queue and mint NFT
3. `list_for_sale(token_id: u32, price: u128)` - List token for sale
4. `buy_token(token_id: u32, buyer: Address, xlm_token: Address)` - Buy token (atomic swap)
5. `owner_of(token_id: u32)` - Get token owner
6. `get_price(token_id: u32)` - Get token price
7. `get_next_token_id()` - Get total tokens minted

## Native Token (XLM) on Testnet

For the `buy_token` function, use the native XLM token address:
- **Testnet Native Asset**: Will be wrapped in SAC (Stellar Asset Contract)

