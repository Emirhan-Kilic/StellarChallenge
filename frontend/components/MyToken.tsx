"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getQueueData, buildListForSaleTx, submitTransaction } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface MyTokenProps {
  userAddress: string;
  onUpdate?: () => void;
}

export default function MyToken({ userAddress, onUpdate }: MyTokenProps) {
  const [myToken, setMyToken] = useState<{
    tokenId: number;
    owner: string;
    price: string;
    isForSale: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(false);
  const [price, setPrice] = useState("");

  useEffect(() => {
    loadMyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  async function loadMyToken() {
    setLoading(true);
    const tokens = await getQueueData();
    const mine = tokens.find((t) => t.owner === userAddress);
    setMyToken(mine || null);
    setLoading(false);
  }

  async function handleListForSale() {
    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (!myToken) {
      alert("No token to list");
      return;
    }

    setListing(true);
    try {
      // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
      const priceInStroops = Math.floor(parseFloat(price) * 10000000).toString();
      
      // Build transaction
      const txXdr = await buildListForSaleTx(userAddress, myToken.tokenId, priceInStroops);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert("Token listed successfully!");
        setPrice("");
        await loadMyToken();
        onUpdate?.();
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("List error:", err);
      alert("Failed to list token: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setListing(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!myToken) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">You don&apos;t have a queue token yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Queue Token</h3>
        <div className="inline-block bg-white p-6 rounded-lg border-2 border-blue-300">
          <QRCodeSVG value={myToken.tokenId.toString()} size={200} />
        </div>
        <p className="mt-3 text-2xl font-bold text-blue-600">Position #{myToken.tokenId}</p>
        {myToken.isForSale && (
          <p className="mt-1 text-green-600 font-medium">
            Listed for {(parseInt(myToken.price) / 10000000).toFixed(2)} XLM
          </p>
        )}
      </div>

      {!myToken.isForSale && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">List for Sale</h4>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in XLM"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleListForSale}
              disabled={listing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {listing ? "Listing..." : "List"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-1">QR Code Verification</p>
        <p>
          Show this QR code to the verifier (e.g., barista) to prove you own position #{myToken.tokenId}.
        </p>
      </div>
    </div>
  );
}

