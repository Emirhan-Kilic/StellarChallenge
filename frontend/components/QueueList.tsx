"use client";

import { useState, useEffect } from "react";
import { getQueueData, QueueToken, buildBuyTokenTx, submitTransaction } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface QueueListProps {
  userAddress: string | null;
  queueId: number | null;
  onRefresh?: () => void;
}

export default function QueueList({ userAddress, queueId, onRefresh }: QueueListProps) {
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);

  useEffect(() => {
    if (queueId !== null) {
      loadQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  async function loadQueue() {
    if (queueId === null) return;
    
    setLoading(true);
    const data = await getQueueData(queueId);
    setTokens(data);
    setLoading(false);
  }

  async function handleBuy(tokenId: number) {
    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (queueId === null) {
      alert("No queue selected");
      return;
    }

    setBuying(tokenId);
    try {
      // Build transaction
      const txXdr = await buildBuyTokenTx(userAddress, queueId, tokenId);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert("Token purchased successfully!");
        await loadQueue();
        onRefresh?.();
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("Buy error:", err);
      alert("Failed to buy token: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBuying(null);
    }
  }

  if (queueId === null) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please select a queue to view</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading queue...</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No one in the queue yet. Be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Queue ({tokens.length} positions)</h3>
        <button
          onClick={loadQueue}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {tokens.map((token) => (
        <div
          key={token.tokenId}
          className={`border rounded-lg p-4 transition ${
            token.owner === userAddress
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Position #{token.tokenId}</p>
              <p className="font-mono text-xs text-gray-500 mt-1">
                {token.owner.slice(0, 8)}...{token.owner.slice(-8)}
              </p>
              {token.owner === userAddress && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                  Your Token
                </span>
              )}
            </div>

            <div className="text-right">
              {token.isForSale ? (
                <div>
                  <p className="text-sm font-semibold text-green-600">
                    {(parseInt(token.price) / 10000000).toFixed(2)} XLM
                  </p>
                  {token.owner !== userAddress && userAddress && (
                    <button
                      onClick={() => handleBuy(token.tokenId)}
                      disabled={buying === token.tokenId}
                      className="mt-2 px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {buying === token.tokenId ? "Buying..." : "Buy"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not for sale</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

