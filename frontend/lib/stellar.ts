import * as StellarSdk from "@stellar/stellar-sdk";

// Contract deployed on Testnet
export const CONTRACT_ID = "CCT7MMUOIM46ABX6FXSIYNJSHLI4CBF2RZ2MSVZM6YXLS4PABU6SPNPE";
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
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "list_for_sale",
        StellarSdk.nativeToScVal(tokenId, { type: "u32" }),
        StellarSdk.nativeToScVal(price, { type: "u128" })
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
      return StellarSdk.StrKey.encodeEd25519PublicKey(scVal.address().accountId().ed25519());
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
      return scVal.u128().toString();
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
      return scVal.u32();
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
    const tokens: QueueToken[] = [];
    
    for (let i = 0; i < totalTokens; i++) {
      const owner = await getOwnerOf(i);
      const price = await getPrice(i);
      
      if (owner) {
        tokens.push({
          tokenId: i,
          owner,
          price: price || "0",
          isForSale: price !== "0" && price !== null,
        });
      }
    }
    
    return tokens;
  } catch (err) {
    console.error("Error getting queue data:", err);
    return [];
  }
}

