"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getUserTokens, getAllQueues, buildListForSaleTx, buildCancelSaleTx, submitTransaction, QueueToken, QueueInfo } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface MyTokenProps {
  userAddress: string;
  onUpdate?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function MyToken({ 
  userAddress, 
  onUpdate,
  autoRefresh = true,
  refreshInterval = 15000
}: MyTokenProps) {
  const [myTokens, setMyTokens] = useState<QueueToken[]>([]);
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<string | null>(null); // "queueId-tokenId"
  const [canceling, setCanceling] = useState<string | null>(null); // "queueId-tokenId"
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);

  useEffect(() => {
    loadMyTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefreshing) return;

    const interval = setInterval(() => {
      loadMyTokens();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoRefreshing, refreshInterval]);

  async function loadMyTokens() {
    setLoading(true);
    const [tokens, allQueues] = await Promise.all([
      getUserTokens(userAddress),
      getAllQueues()
    ]);
    setMyTokens(tokens);
    setQueues(allQueues);
    setLastUpdate(new Date());
    setLoading(false);
  }

  function getTokenKey(queueId: number, tokenId: number): string {
    return `${queueId}-${tokenId}`;
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

  async function handleListForSale(queueId: number, tokenId: number) {
    const key = getTokenKey(queueId, tokenId);
    const price = prices[key];
    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setListing(key);
    try {
      // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
      const priceInStroops = Math.floor(parseFloat(price) * 10000000).toString();
      
      // Build transaction
      const txXdr = await buildListForSaleTx(userAddress, queueId, tokenId, priceInStroops);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert(`Token #${tokenId} in queue #${queueId} listed successfully!`);
        setPrices(prev => ({ ...prev, [key]: "" }));
        await loadMyTokens();
        onUpdate?.();
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("List error:", err);
      alert("Failed to list token: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setListing(null);
    }
  }

  async function handleCancelSale(queueId: number, tokenId: number) {
    const key = getTokenKey(queueId, tokenId);
    setCanceling(key);
    try {
      // Build transaction
      const txXdr = await buildCancelSaleTx(userAddress, queueId, tokenId);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert(`Token #${tokenId} in queue #${queueId} sale canceled successfully!`);
        await loadMyTokens();
        onUpdate?.();
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel sale: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCanceling(null);
    }
  }

  function updatePrice(queueId: number, tokenId: number, value: string) {
    const key = getTokenKey(queueId, tokenId);
    setPrices(prev => ({ ...prev, [key]: value }));
  }

  function getQueueName(queueId: number): string {
    return queues.find(q => q.queueId === queueId)?.name || `Queue #${queueId}`;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (myTokens.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">You don&apos;t have any queue tokens yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Your Queue Tokens ({myTokens.length})
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
            onClick={loadMyTokens}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myTokens.map((token) => {
          const key = getTokenKey(token.queueId, token.tokenId);
          return (
            <div
              key={key}
              className="bg-white border-2 border-blue-300 rounded-lg p-6 space-y-4"
            >
              {/* Queue Name Badge */}
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {getQueueName(token.queueId)}
                </span>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block bg-white p-4 rounded-lg border border-gray-200">
                  <QRCodeSVG value={`${token.queueId}-${token.tokenId}`} size={150} level="H" />
                </div>
                <p className="mt-3 text-2xl font-bold text-blue-600">
                  Position #{token.tokenId}
                </p>
                {token.isForSale && (
                  <p className="mt-1 text-green-600 font-medium">
                    Listed for {(parseInt(token.price) / 10000000).toFixed(2)} XLM
                  </p>
                )}
              </div>

              {/* List for Sale (if not already listed) */}
              {!token.isForSale ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    List for Sale
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={prices[key] || ""}
                      onChange={(e) => updatePrice(token.queueId, token.tokenId, e.target.value)}
                      onInput={(e) => updatePrice(token.queueId, token.tokenId, (e.target as HTMLInputElement).value)}
                      placeholder="Price in XLM"
                      disabled={listing === key}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => handleListForSale(token.queueId, token.tokenId)}
                      disabled={listing === key || !prices[key]}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listing === key ? "Listing..." : "List"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 text-sm">
                    ✓ Currently Listed
                  </h4>
                  <p className="text-green-700 text-sm mb-3">
                    This token is listed for {(parseInt(token.price) / 10000000).toFixed(2)} XLM
                  </p>
                  <button
                    onClick={() => handleCancelSale(token.queueId, token.tokenId)}
                    disabled={canceling === key}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canceling === key ? "Canceling..." : "Cancel Sale"}
                  </button>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 rounded p-3 text-xs text-gray-600">
                <p className="font-medium text-gray-900 mb-1">QR Verification</p>
                <p>Show this QR code to verify you own position #{token.tokenId}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

