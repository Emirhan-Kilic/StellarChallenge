"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getUserTokens, buildListForSaleTx, submitTransaction, QueueToken } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface MyTokenProps {
  userAddress: string;
  onUpdate?: () => void;
}

export default function MyToken({ userAddress, onUpdate }: MyTokenProps) {
  const [myTokens, setMyTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});

  useEffect(() => {
    loadMyTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  async function loadMyTokens() {
    setLoading(true);
    const tokens = await getUserTokens(userAddress);
    setMyTokens(tokens);
    setLoading(false);
  }

  async function handleListForSale(tokenId: number) {
    const price = prices[tokenId];
    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setListing(tokenId);
    try {
      // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
      const priceInStroops = Math.floor(parseFloat(price) * 10000000).toString();
      
      // Build transaction
      const txXdr = await buildListForSaleTx(userAddress, tokenId, priceInStroops);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert(`Token #${tokenId} listed successfully!`);
        setPrices(prev => ({ ...prev, [tokenId]: "" }));
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

  function updatePrice(tokenId: number, value: string) {
    setPrices(prev => ({ ...prev, [tokenId]: value }));
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
      <h3 className="text-xl font-bold text-gray-900">
        Your Queue Tokens ({myTokens.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myTokens.map((token) => (
          <div
            key={token.tokenId}
            className="bg-white border-2 border-blue-300 rounded-lg p-6 space-y-4"
          >
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG value={token.tokenId.toString()} size={150} level="H" />
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
                    value={prices[token.tokenId] || ""}
                    onChange={(e) => updatePrice(token.tokenId, e.target.value)}
                    onInput={(e) => updatePrice(token.tokenId, (e.target as HTMLInputElement).value)}
                    placeholder="Price in XLM"
                    disabled={listing === token.tokenId}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={() => handleListForSale(token.tokenId)}
                    disabled={listing === token.tokenId || !prices[token.tokenId]}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {listing === token.tokenId ? "Listing..." : "List"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 text-sm">
                  ✓ Currently Listed
                </h4>
                <p className="text-green-700 text-sm">
                  This token is already listed for {(parseInt(token.price) / 10000000).toFixed(2)} XLM
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded p-3 text-xs text-gray-600">
              <p className="font-medium text-gray-900 mb-1">QR Verification</p>
              <p>Show this QR code to verify you own position #{token.tokenId}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

