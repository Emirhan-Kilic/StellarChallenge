#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_init_and_join_queue() {
    let env = Env::default();
    let contract_id = env.register_contract(None, QueueContract);
    let client = QueueContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    
    // Initialize queue
    client.init_queue(&admin);
    
    // Join queue
    env.mock_all_auths();
    let token_id = client.join_queue(&user1);
    
    assert_eq!(token_id, 0);
    assert_eq!(client.owner_of(&token_id), user1);
    assert_eq!(client.get_next_token_id(), 1);
}

#[test]
fn test_list_for_sale() {
    let env = Env::default();
    let contract_id = env.register_contract(None, QueueContract);
    let client = QueueContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    
    client.init_queue(&admin);
    
    env.mock_all_auths();
    let token_id = client.join_queue(&user1);
    
    // List for sale
    let price = 1000u128;
    client.list_for_sale(&token_id, &price);
    
    assert_eq!(client.get_price(&token_id), price);
}

#[test]
#[ignore] // Skip in unit tests - requires actual token contract. Will test on Testnet.
fn test_buy_token() {
    let env = Env::default();
    let contract_id = env.register_contract(None, QueueContract);
    let client = QueueContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let xlm_token = Address::generate(&env);
    
    client.init_queue(&admin);
    
    env.mock_all_auths();
    
    // Seller joins queue
    let token_id = client.join_queue(&seller);
    
    // Seller lists token
    let price = 1000u128;
    client.list_for_sale(&token_id, &price);
    
    // Buyer purchases token - mock auth for the transfer
    client.buy_token(&token_id, &buyer, &xlm_token);
    
    // Verify ownership transferred
    assert_eq!(client.owner_of(&token_id), buyer);
    
    // Verify token is no longer for sale
    assert_eq!(client.get_price(&token_id), 0);
}

#[test]
#[should_panic(expected = "Token does not exist")]
fn test_owner_of_nonexistent_token() {
    let env = Env::default();
    let contract_id = env.register_contract(None, QueueContract);
    let client = QueueContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    client.init_queue(&admin);
    
    // Try to get owner of non-existent token
    client.owner_of(&999);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_double_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, QueueContract);
    let client = QueueContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    client.init_queue(&admin);
    client.init_queue(&admin); // Should panic
}
