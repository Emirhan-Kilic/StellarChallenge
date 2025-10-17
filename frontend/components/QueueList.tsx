"use client";

import { useState, useEffect } from "react";
import { getQueueData, QueueToken, buildBuyTokenTx, submitTransaction } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface QueueListProps {
  userAddress: string | null;
  queueId: number | null;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function QueueList({ 
  userAddress, 
  queueId, 
  onRefresh,
  autoRefresh = true,
  refreshInterval = 10000
}: QueueListProps) {
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);

  useEffect(() => {
    if (queueId !== null) {
      setIsInitialLoad(true); // Reset when queue changes
      loadQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefreshing || queueId === null) return;

    const interval = setInterval(() => {
      loadQueue();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoRefreshing, queueId, refreshInterval]);

  async function loadQueue() {
    if (queueId === null) return;
    
    // Only show loading spinner on initial load
    if (isInitialLoad) {
      setLoading(true);
    }
    
    const data = await getQueueData(queueId);
    setTokens(data);
    setLastUpdate(new Date());
    
    if (isInitialLoad) {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }

  function toggleAutoRefresh() {
    setIsAutoRefreshing(!isAutoRefreshing);
  }

  function getTimeSinceUpdate(): string {
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
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

  // Only show loading spinner on initial load (not on auto-refresh)
  if (loading && tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading queue...</p>
      </div>
    );
  }

  if (!loading && tokens.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No one in the queue yet. Be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Queue ({tokens.length} positions)
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Updated {getTimeSinceUpdate()}
            </span>
            {isAutoRefreshing && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoRefresh}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              isAutoRefreshing
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isAutoRefreshing ? "⏸ Pause" : "▶ Auto"}
          </button>
          <button
            onClick={loadQueue}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition"
          >
            🔄 Refresh
          </button>
        </div>
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

