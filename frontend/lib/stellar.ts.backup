import * as StellarSdk from "@stellar/stellar-sdk";

// Contract deployed on Testnet
export const CONTRACT_ID = "CB4KYG6XSUXNCTEX7APZ4R3ATJG3XKD7GGCT3EWFESWRCGAX734EQR45";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const RPC_URL = "https://soroban-testnet.stellar.org:443";

// Initialize Soroban RPC server
const server = new StellarSdk.rpc.Server(RPC_URL);

// Native XLM token address for Testnet - will be computed on-demand
let nativeTokenAddress: string | null = null;

export async function getNativeTokenAddress(): Promise<string> {
  if (nativeTokenAddress) return nativeTokenAddress;
  
  // Get the native asset contract address
  const native = StellarSdk.Asset.native();
  nativeTokenAddress = native.contractId(NETWORK_PASSPHRASE);
  return nativeTokenAddress;
}

// Queue Info interface
export interface QueueInfo {
  queueId: number;
  name: string;
  creator: string;
  tokenCount: number;
}

// Queue Token interface
export interface QueueToken {
  queueId: number;
  tokenId: number;
  owner: string;
  price: string;
  isForSale: boolean;
}

// ============================================================================
// QUEUE MANAGEMENT FUNCTIONS
// ============================================================================

// Build transaction for creating a new queue
export async function buildCreateQueueTx(
  userAddress: string,
  queueName: string
): Promise<string> {
  const account = await server.getAccount(userAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_queue",
        StellarSdk.nativeToScVal(queueName, { type: "string" }),
        StellarSdk.nativeToScVal(userAddress, { type: "address" })
      )
    )
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Get total number of queues
export async function getQueueCount(): Promise<number> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_queue_count"))
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return Number(nativeValue);
    }
    
    return 0;
  } catch (err) {
    console.error("Error getting queue count:", err);
    return 0;
  }
}

// Get queue name
export async function getQueueName(queueId: number): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_queue_name",
          StellarSdk.nativeToScVal(queueId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return nativeValue;
    }
    
    return null;
  } catch (err) {
    console.error("Error getting queue name:", err);
    return null;
  }
}

// Get queue creator
export async function getQueueCreator(queueId: number): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_queue_creator",
          StellarSdk.nativeToScVal(queueId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return nativeValue;
    }
    
    return null;
  } catch (err) {
    console.error("Error getting queue creator:", err);
    return null;
  }
}

// Get all queues with their info
export async function getAllQueues(): Promise<QueueInfo[]> {
  try {
    const queueCount = await getQueueCount();
    
    // Fetch all queue info in parallel
    const promises = Array.from({ length: queueCount }, async (_, i) => {
      const [name, creator, tokenCount] = await Promise.all([
        getQueueName(i),
        getQueueCreator(i),
        getNextTokenId(i)
      ]);
      
      if (name && creator !== null) {
        return {
          queueId: i,
          name,
          creator,
          tokenCount
        };
      }
      return null;
    });
    
    const results = await Promise.all(promises);
    return results.filter((q): q is QueueInfo => q !== null);
  } catch (err) {
    console.error("Error getting all queues:", err);
    return [];
  }
}

// ============================================================================
// TOKEN TRANSACTION BUILDERS
// ============================================================================

// Build transaction for joining a queue
export async function buildJoinQueueTx(
  userAddress: string,
  queueId: number
): Promise<string> {
  const account = await server.getAccount(userAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "join_queue",
        StellarSdk.nativeToScVal(queueId, { type: "u32" }),
        StellarSdk.nativeToScVal(userAddress, { type: "address" })
      )
    )
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Build transaction for listing token for sale
export async function buildListForSaleTx(
  userAddress: string,
  queueId: number,
  tokenId: number,
  price: string
): Promise<string> {
  const account = await server.getAccount(userAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  // Convert price string to BigInt for u128
  const priceBigInt = BigInt(price);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "list_for_sale",
        StellarSdk.nativeToScVal(queueId, { type: "u32" }),
        StellarSdk.nativeToScVal(tokenId, { type: "u32" }),
        StellarSdk.nativeToScVal(priceBigInt, { type: "u128" })
      )
    )
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Build transaction for canceling token sale
export async function buildCancelSaleTx(
  userAddress: string,
  queueId: number,
  tokenId: number
): Promise<string> {
  const account = await server.getAccount(userAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "cancel_sale",
        StellarSdk.nativeToScVal(queueId, { type: "u32" }),
        StellarSdk.nativeToScVal(tokenId, { type: "u32" })
      )
    )
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Build transaction for buying a token
export async function buildBuyTokenTx(
  buyerAddress: string,
  queueId: number,
  tokenId: number
): Promise<string> {
  const account = await server.getAccount(buyerAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const xlmToken = await getNativeTokenAddress();
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "10000000", // Higher fee for complex transaction
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "buy_token",
        StellarSdk.nativeToScVal(queueId, { type: "u32" }),
        StellarSdk.nativeToScVal(tokenId, { type: "u32" }),
        StellarSdk.nativeToScVal(buyerAddress, { type: "address" }),
        StellarSdk.nativeToScVal(xlmToken, { type: "address" })
      )
    )
    .setTimeout(300)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Submit a signed transaction
export async function submitTransaction(signedXdr: string): Promise<StellarSdk.rpc.Api.GetTransactionResponse> {
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx as StellarSdk.Transaction);
  
  // Poll for transaction status
  let status = await server.getTransaction(result.hash);
  while (status.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    status = await server.getTransaction(result.hash);
  }
  
  return status;
}

// ============================================================================
// TOKEN QUERY FUNCTIONS
// ============================================================================

// Get owner of a token
export async function getOwnerOf(queueId: number, tokenId: number): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "owner_of",
          StellarSdk.nativeToScVal(queueId, { type: "u32" }),
          StellarSdk.nativeToScVal(tokenId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return nativeValue;
    }
    
    return null;
  } catch (err) {
    console.error("Error getting owner:", err);
    return null;
  }
}

// Get price of a token
export async function getPrice(queueId: number, tokenId: number): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_price",
          StellarSdk.nativeToScVal(queueId, { type: "u32" }),
          StellarSdk.nativeToScVal(tokenId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return nativeValue.toString();
    }
    
    return "0";
  } catch (err) {
    console.error("Error getting price:", err);
    return "0";
  }
}

// Get next token ID for a queue (total minted in that queue)
export async function getNextTokenId(queueId: number): Promise<number> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_next_token_id",
          StellarSdk.nativeToScVal(queueId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      const nativeValue = StellarSdk.scValToNative(scVal);
      return Number(nativeValue);
    }
    
    return 0;
  } catch (err) {
    console.error("Error getting next token ID:", err);
    return 0;
  }
}

// Get all tokens in a specific queue
export async function getQueueData(queueId: number): Promise<QueueToken[]> {
  try {
    const totalTokens = await getNextTokenId(queueId);
    
    // Fetch all owners and prices in parallel
    const ownerPromises = Array.from({ length: totalTokens }, (_, i) => getOwnerOf(queueId, i));
    const pricePromises = Array.from({ length: totalTokens }, (_, i) => getPrice(queueId, i));
    
    const [owners, prices] = await Promise.all([
      Promise.all(ownerPromises),
      Promise.all(pricePromises)
    ]);
    
    // Build tokens array
    const tokens: QueueToken[] = [];
    for (let i = 0; i < totalTokens; i++) {
      if (owners[i]) {
        tokens.push({
          queueId,
          tokenId: i,
          owner: owners[i]!,
          price: prices[i] || "0",
          isForSale: prices[i] !== "0" && prices[i] !== null,
        });
      }
    }
    
    return tokens;
  } catch (err) {
    console.error("Error getting queue data:", err);
    return [];
  }
}

// Get user's tokens across ALL queues
export async function getUserTokens(userAddress: string): Promise<QueueToken[]> {
  try {
    const queueCount = await getQueueCount();
    const allUserTokens: QueueToken[] = [];
    
    // Check each queue
    for (let queueId = 0; queueId < queueCount; queueId++) {
      const totalTokens = await getNextTokenId(queueId);
      
      // Check all tokens in parallel batches
      const batchSize = 10;
      for (let start = 0; start < totalTokens; start += batchSize) {
        const end = Math.min(start + batchSize, totalTokens);
        const batch = Array.from({ length: end - start }, (_, i) => start + i);
        
        const owners = await Promise.all(batch.map(i => getOwnerOf(queueId, i)));
        
        // Find all tokens owned by user in this batch
        const userTokenIds = batch.filter((tokenId, index) => owners[index] === userAddress);
        
        // Get prices for user's tokens
        if (userTokenIds.length > 0) {
          const prices = await Promise.all(userTokenIds.map(id => getPrice(queueId, id)));
          
          userTokenIds.forEach((tokenId, index) => {
            allUserTokens.push({
              queueId,
              tokenId,
              owner: userAddress,
              price: prices[index] || "0",
              isForSale: prices[index] !== "0" && prices[index] !== null,
            });
          });
        }
      }
    }
    
    return allUserTokens;
  } catch (err) {
    console.error("Error getting user tokens:", err);
    return [];
  }
}

// Get user's tokens in a specific queue
export async function getUserTokensInQueue(userAddress: string, queueId: number): Promise<QueueToken[]> {
  try {
    const totalTokens = await getNextTokenId(queueId);
    const userTokens: QueueToken[] = [];
    
    // Check all tokens in parallel batches
    const batchSize = 10;
    for (let start = 0; start < totalTokens; start += batchSize) {
      const end = Math.min(start + batchSize, totalTokens);
      const batch = Array.from({ length: end - start }, (_, i) => start + i);
      
      const owners = await Promise.all(batch.map(i => getOwnerOf(queueId, i)));
      
      // Find all tokens owned by user in this batch
      const userTokenIds = batch.filter((tokenId, index) => owners[index] === userAddress);
      
      // Get prices for user's tokens
      if (userTokenIds.length > 0) {
        const prices = await Promise.all(userTokenIds.map(id => getPrice(queueId, id)));
        
        userTokenIds.forEach((tokenId, index) => {
          userTokens.push({
            queueId,
            tokenId,
            owner: userAddress,
            price: prices[index] || "0",
            isForSale: prices[index] !== "0" && prices[index] !== null,
          });
        });
      }
    }
    
    return userTokens;
  } catch (err) {
    console.error("Error getting user tokens in queue:", err);
    return [];
  }
}
