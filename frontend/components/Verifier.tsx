"use client";

import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getOwnerOf } from "@/lib/stellar";

export default function Verifier() {
  const [scanning, setScanning] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    tokenId: number;
    owner: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(true);

  async function handleVerify() {
    if (!tokenId || isNaN(parseInt(tokenId))) {
      setError("Please enter a valid token ID");
      return;
    }

    setError("");
    setVerificationResult(null);

    try {
      const owner = await getOwnerOf(parseInt(tokenId));
      if (owner) {
        setVerificationResult({
          tokenId: parseInt(tokenId),
          owner,
        });
      } else {
        setError("Token not found or does not exist");
      }
    } catch (err) {
      setError("Verification failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function startScanner() {
    setScanning(true);
    setError("");
    setManualMode(false);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning
          await html5QrCode.stop();
          setScanning(false);
          
          // Verify the scanned token
          setTokenId(decodedText);
          const owner = await getOwnerOf(parseInt(decodedText));
          if (owner) {
            setVerificationResult({
              tokenId: parseInt(decodedText),
              owner,
            });
          } else {
            setError("Token not found");
          }
        },
        () => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      setError("Failed to start camera: " + (err instanceof Error ? err.message : String(err)));
      setScanning(false);
      setManualMode(true);
    }
  }

  async function stopScanner() {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      await html5QrCode.stop();
      setScanning(false);
      setManualMode(true);
    } catch {
      setScanning(false);
      setManualMode(true);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Token Verifier</h2>
        <p className="text-gray-600 mt-1">Scan or enter token ID to verify ownership</p>
      </div>

      {manualMode ? (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token ID
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Verify
              </button>
            </div>
          </div>

          <button
            onClick={startScanner}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            📷 Scan QR Code
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
          {scanning && (
            <button
              onClick={stopScanner}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Stop Scanning
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {verificationResult && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-green-900 font-bold text-lg">Verified</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-green-800">
              <span className="font-semibold">Token ID:</span> #{verificationResult.tokenId}
            </p>
            <p className="text-green-800">
              <span className="font-semibold">Owner:</span>
            </p>
            <p className="font-mono text-xs text-green-700 bg-green-100 p-2 rounded break-all">
              {verificationResult.owner}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

