#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, token};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    NextTokenId,
    Owner(u32),      // token_id -> owner address
    Price(u32),      // token_id -> price (0 means not for sale)
}

#[contract]
pub struct QueueContract;

#[contractimpl]
impl QueueContract {
    /// Initialize the queue contract with an admin address
    pub fn init_queue(env: Env, admin: Address) {
        // Ensure contract hasn't been initialized
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        // Set admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize token counter to 0
        env.storage().instance().set(&DataKey::NextTokenId, &0u32);
    }

    /// Join the queue - mints the next sequential NFT to the caller
    pub fn join_queue(env: Env, user: Address) -> u32 {
        // Verify user authorization
        user.require_auth();
        
        // Get next token ID
        let token_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(0);
        
        // Mint NFT: assign token to user
        env.storage().instance().set(&DataKey::Owner(token_id), &user);
        
        // Increment counter
        env.storage().instance().set(&DataKey::NextTokenId, &(token_id + 1));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "joined"), token_id),
            user.clone()
        );
        
        token_id
    }

    /// List a token for sale at a specified price
    pub fn list_for_sale(env: Env, token_id: u32, price: u128) {
        // Get current owner
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .expect("Token does not exist");
        
        // Verify caller owns the token
        owner.require_auth();
        
        // Ensure price is greater than 0
        if price == 0 {
            panic!("Price must be greater than 0");
        }
        
        // Set price (marks token as for sale)
        env.storage().instance().set(&DataKey::Price(token_id), &price);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "listed"), token_id),
            price
        );
    }

    /// Cancel sale - remove token from marketplace
    pub fn cancel_sale(env: Env, token_id: u32) {
        // Get current owner
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .expect("Token does not exist");
        
        // Verify caller owns the token
        owner.require_auth();
        
        // Check if token is actually for sale
        let is_for_sale = env
            .storage()
            .instance()
            .has(&DataKey::Price(token_id));
        
        if !is_for_sale {
            panic!("Token is not for sale");
        }
        
        // Remove price (unlist from sale)
        env.storage().instance().remove(&DataKey::Price(token_id));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "cancelled"), token_id),
            owner.clone()
        );
    }

    /// Buy a token - performs atomic swap of XLM for NFT
    pub fn buy_token(env: Env, token_id: u32, buyer: Address, xlm_token: Address) {
        // Verify buyer authorization
        buyer.require_auth();
        
        // Get current owner (seller)
        let seller: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .expect("Token does not exist");
        
        // Get price
        let price: u128 = env
            .storage()
            .instance()
            .get(&DataKey::Price(token_id))
            .expect("Token is not for sale");
        
        // Ensure buyer is not the seller
        if buyer == seller {
            panic!("Cannot buy your own token");
        }
        
        // Get token client for XLM transfers
        let token_client = token::TokenClient::new(&env, &xlm_token);
        
        // ATOMIC SWAP:
        // 1. Transfer XLM from buyer to seller
        token_client.transfer(&buyer, &seller, &(price as i128));
        
        // 2. Transfer NFT ownership to buyer
        env.storage().instance().set(&DataKey::Owner(token_id), &buyer);
        
        // 3. Remove from sale (set price to 0 / remove entry)
        env.storage().instance().remove(&DataKey::Price(token_id));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "sold"), token_id),
            (seller.clone(), buyer.clone(), price)
        );
    }

    /// Get the owner of a token (for verification)
    pub fn owner_of(env: Env, token_id: u32) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .expect("Token does not exist")
    }

    /// Get the price of a token (0 if not for sale)
    pub fn get_price(env: Env, token_id: u32) -> u128 {
        env.storage()
            .instance()
            .get(&DataKey::Price(token_id))
            .unwrap_or(0)
    }

    /// Get the next token ID (total tokens minted)
    pub fn get_next_token_id(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(0)
    }
}

mod test;
