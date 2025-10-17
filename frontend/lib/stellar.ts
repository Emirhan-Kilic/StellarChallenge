import * as StellarSdk from "@stellar/stellar-sdk";

// Contract deployed on Testnet
export const CONTRACT_ID = "CAWE4YAL474UU4UKBKJPLFTLZLNBFIEILKEDKJPHF7JPRQ5OT7UG4NAM";
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

// Build transaction for joining the queue
export async function buildJoinQueueTx(userAddress: string): Promise<string> {
  const account = await server.getAccount(userAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "join_queue",
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
        StellarSdk.nativeToScVal(tokenId, { type: "u32" }),
        StellarSdk.nativeToScVal(priceBigInt, { type: "u128" })
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

// Get owner of a token
export async function getOwnerOf(tokenId: number): Promise<string | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" // Null account for view calls
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "owner_of",
          StellarSdk.nativeToScVal(tokenId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      // Convert ScVal address to native string
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
export async function getPrice(tokenId: number): Promise<string | null> {
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
          StellarSdk.nativeToScVal(tokenId, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      // Convert ScVal to native JavaScript value
      const nativeValue = StellarSdk.scValToNative(scVal);
      return nativeValue.toString();
    }
    
    return "0";
  } catch (err) {
    console.error("Error getting price:", err);
    return "0";
  }
}

// Get next token ID (total minted)
export async function getNextTokenId(): Promise<number> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await server.getAccount(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_next_token_id"))
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);
    
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const scVal = simulation.result.retval;
      // Convert ScVal to native JavaScript value
      const nativeValue = StellarSdk.scValToNative(scVal);
      return Number(nativeValue);
    }
    
    return 0;
  } catch (err) {
    console.error("Error getting next token ID:", err);
    return 0;
  }
}

// Get all queue data
export interface QueueToken {
  tokenId: number;
  owner: string;
  price: string;
  isForSale: boolean;
}

export async function getQueueData(): Promise<QueueToken[]> {
  try {
    const totalTokens = await getNextTokenId();
    
    // Fetch all owners and prices in parallel
    const ownerPromises = Array.from({ length: totalTokens }, (_, i) => getOwnerOf(i));
    const pricePromises = Array.from({ length: totalTokens }, (_, i) => getPrice(i));
    
    const [owners, prices] = await Promise.all([
      Promise.all(ownerPromises),
      Promise.all(pricePromises)
    ]);
    
    // Build tokens array
    const tokens: QueueToken[] = [];
    for (let i = 0; i < totalTokens; i++) {
      if (owners[i]) {
        tokens.push({
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

// Optimized: Find ALL user's tokens without fetching entire queue
export async function getUserTokens(userAddress: string): Promise<QueueToken[]> {
  try {
    const totalTokens = await getNextTokenId();
    const userTokens: QueueToken[] = [];
    
    // Check all tokens in parallel batches
    const batchSize = 10;
    for (let start = 0; start < totalTokens; start += batchSize) {
      const end = Math.min(start + batchSize, totalTokens);
      const batch = Array.from({ length: end - start }, (_, i) => start + i);
      
      const owners = await Promise.all(batch.map(i => getOwnerOf(i)));
      
      // Find all tokens owned by user in this batch
      const userTokenIds = batch.filter((tokenId, index) => owners[index] === userAddress);
      
      // Get prices for user's tokens
      if (userTokenIds.length > 0) {
        const prices = await Promise.all(userTokenIds.map(id => getPrice(id)));
        
        userTokenIds.forEach((tokenId, index) => {
          userTokens.push({
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
    console.error("Error getting user tokens:", err);
    return [];
  }
}

// Backward compatibility: Get user's first token
export async function getUserToken(userAddress: string): Promise<QueueToken | null> {
  const tokens = await getUserTokens(userAddress);
  return tokens.length > 0 ? tokens[0] : null;
}

