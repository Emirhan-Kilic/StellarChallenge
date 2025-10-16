import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
  getNetworkDetails,
} from "@stellar/freighter-api";

export async function checkFreighterInstalled(): Promise<boolean> {
  const { isConnected: connected } = await isConnected();
  return connected;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const { address, error } = await requestAccess();
    if (error) {
      console.error("Wallet connection error:", error);
      return null;
    }
    return address;
  } catch (err) {
    console.error("Failed to connect wallet:", err);
    return null;
  }
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const { address, error } = await getAddress();
    if (error) {
      console.error("Failed to get address:", error);
      return null;
    }
    return address;
  } catch (err) {
    console.error("Failed to get wallet address:", err);
    return null;
  }
}

export async function signTx(xdr: string, userAddress: string): Promise<string | null> {
  try {
    const { signedTxXdr, error } = await signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: userAddress,
    });
    
    if (error) {
      console.error("Transaction signing error:", error);
      return null;
    }
    
    return signedTxXdr;
  } catch (err) {
    console.error("Failed to sign transaction:", err);
    return null;
  }
}

export async function getNetwork() {
  try {
    const details = await getNetworkDetails();
    return details;
  } catch (err) {
    console.error("Failed to get network details:", err);
    return null;
  }
}

