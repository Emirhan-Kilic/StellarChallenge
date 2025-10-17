#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, token};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    QueueCount,                    // Total number of queues created
    QueueName(u32),                // queue_id -> name
    QueueCreator(u32),             // queue_id -> creator address
    QueueNextToken(u32),           // queue_id -> next token ID for this queue
    Owner(u32, u32),               // (queue_id, token_id) -> owner address
    Price(u32, u32),               // (queue_id, token_id) -> price (0 means not for sale)
}

#[contract]
pub struct QueueContract;

#[contractimpl]
impl QueueContract {
    /// Initialize the contract with an admin address
    pub fn init_contract(env: Env, admin: Address) {
        // Ensure contract hasn't been initialized
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        // Set admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize queue counter to 0
        env.storage().instance().set(&DataKey::QueueCount, &0u32);
    }

    /// Create a new queue
    pub fn create_queue(env: Env, name: String, creator: Address) -> u32 {
        // Verify creator authorization
        creator.require_auth();
        
        // Get next queue ID
        let queue_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::QueueCount)
            .unwrap_or(0);
        
        // Store queue info
        env.storage().instance().set(&DataKey::QueueName(queue_id), &name);
        env.storage().instance().set(&DataKey::QueueCreator(queue_id), &creator);
        env.storage().instance().set(&DataKey::QueueNextToken(queue_id), &0u32);
        
        // Increment queue counter
        env.storage().instance().set(&DataKey::QueueCount, &(queue_id + 1));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "queue_created"), queue_id),
            (name.clone(), creator.clone())
        );
        
        queue_id
    }

    /// Join a queue - mints the next sequential NFT to the caller for that queue
    pub fn join_queue(env: Env, queue_id: u32, user: Address) -> u32 {
        // Verify user authorization
        user.require_auth();
        
        // Verify queue exists
        if !env.storage().instance().has(&DataKey::QueueName(queue_id)) {
            panic!("Queue does not exist");
        }
        
        // Get next token ID for this queue
        let token_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::QueueNextToken(queue_id))
            .unwrap_or(0);
        
        // Mint NFT: assign token to user
        env.storage().instance().set(&DataKey::Owner(queue_id, token_id), &user);
        
        // Increment counter for this queue
        env.storage().instance().set(&DataKey::QueueNextToken(queue_id), &(token_id + 1));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "joined"), queue_id, token_id),
            user.clone()
        );
        
        token_id
    }

    /// List a token for sale at a specified price
    pub fn list_for_sale(env: Env, queue_id: u32, token_id: u32, price: u128) {
        // Get current owner
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(queue_id, token_id))
            .expect("Token does not exist");
        
        // Verify caller owns the token
        owner.require_auth();
        
        // Ensure price is greater than 0
        if price == 0 {
            panic!("Price must be greater than 0");
        }
        
        // Set price (marks token as for sale)
        env.storage().instance().set(&DataKey::Price(queue_id, token_id), &price);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "listed"), queue_id, token_id),
            price
        );
    }

    /// Cancel sale - remove token from marketplace
    pub fn cancel_sale(env: Env, queue_id: u32, token_id: u32) {
        // Get current owner
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(queue_id, token_id))
            .expect("Token does not exist");
        
        // Verify caller owns the token
        owner.require_auth();
        
        // Check if token is actually for sale
        let is_for_sale = env
            .storage()
            .instance()
            .has(&DataKey::Price(queue_id, token_id));
        
        if !is_for_sale {
            panic!("Token is not for sale");
        }
        
        // Remove price (unlist from sale)
        env.storage().instance().remove(&DataKey::Price(queue_id, token_id));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "cancelled"), queue_id, token_id),
            owner.clone()
        );
    }

    /// Buy a token - performs atomic swap of XLM for NFT
    pub fn buy_token(env: Env, queue_id: u32, token_id: u32, buyer: Address, xlm_token: Address) {
        // Verify buyer authorization
        buyer.require_auth();
        
        // Get current owner (seller)
        let seller: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(queue_id, token_id))
            .expect("Token does not exist");
        
        // Get price
        let price: u128 = env
            .storage()
            .instance()
            .get(&DataKey::Price(queue_id, token_id))
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
        env.storage().instance().set(&DataKey::Owner(queue_id, token_id), &buyer);
        
        // 3. Remove from sale (set price to 0 / remove entry)
        env.storage().instance().remove(&DataKey::Price(queue_id, token_id));
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "sold"), queue_id, token_id),
            (seller.clone(), buyer.clone(), price)
        );
    }

    /// Get the owner of a token (for verification)
    pub fn owner_of(env: Env, queue_id: u32, token_id: u32) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Owner(queue_id, token_id))
            .expect("Token does not exist")
    }

    /// Get the price of a token (0 if not for sale)
    pub fn get_price(env: Env, queue_id: u32, token_id: u32) -> u128 {
        env.storage()
            .instance()
            .get(&DataKey::Price(queue_id, token_id))
            .unwrap_or(0)
    }

    /// Get the next token ID for a queue (total tokens minted in that queue)
    pub fn get_next_token_id(env: Env, queue_id: u32) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::QueueNextToken(queue_id))
            .unwrap_or(0)
    }

    /// Get total number of queues created
    pub fn get_queue_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::QueueCount)
            .unwrap_or(0)
    }

    /// Get queue name
    pub fn get_queue_name(env: Env, queue_id: u32) -> String {
        env.storage()
            .instance()
            .get(&DataKey::QueueName(queue_id))
            .expect("Queue does not exist")
    }

    /// Get queue creator
    pub fn get_queue_creator(env: Env, queue_id: u32) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::QueueCreator(queue_id))
            .expect("Queue does not exist")
    }
}

mod test;
