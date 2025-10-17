"use client";

import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getOwnerOf, getQueueName } from "@/lib/stellar";

export default function Verifier() {
  const [scanning, setScanning] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    queueId: number;
    queueName: string;
    tokenId: number;
    owner: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  async function handleVerify(idToVerify?: string) {
    const id = idToVerify || tokenId;
    if (!id || id.trim() === "") {
      setError("Please enter a token ID (format: queueId-tokenId, e.g., 0-5)");
      return;
    }

    setError("");
    setVerificationResult(null);

    try {
      // Parse format: "queueId-tokenId" or just "tokenId" (defaults to queue 0)
      const parts = id.trim().split("-");
      let queueId: number;
      let tId: number;
      
      if (parts.length === 2) {
        queueId = parseInt(parts[0]);
        tId = parseInt(parts[1]);
      } else if (parts.length === 1) {
        queueId = 0; // Default to first queue
        tId = parseInt(parts[0]);
      } else {
        setError("Invalid format. Use 'queueId-tokenId' (e.g., 0-5)");
        return;
      }

      if (isNaN(queueId) || isNaN(tId)) {
        setError("Invalid token ID format");
        return;
      }

      console.log(`Verifying queue ${queueId}, token ${tId}`);
      
      const [owner, queueName] = await Promise.all([
        getOwnerOf(queueId, tId),
        getQueueName(queueId)
      ]);

      if (owner) {
        setVerificationResult({
          queueId,
          queueName: queueName || `Queue #${queueId}`,
          tokenId: tId,
          owner,
        });
        setError(""); // Clear any previous errors
      } else {
        setError("Token not found or does not exist");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleVerify();
    }
  }

  async function startScanner() {
    setError("");
    
    try {
      // Clean up any existing scanner instance first
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // Ignore errors when stopping
        }
        html5QrCodeRef.current = null;
      }

      // Set manualMode to false to render the qr-reader div
      setManualMode(false);
      
      // Wait for React to render the DOM element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the element exists
      const element = document.getElementById("qr-reader");
      if (!element) {
        throw new Error("QR reader element not found after render");
      }

      setScanning(true);

      // Create new scanner instance
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning
          try {
            await html5QrCode.stop();
            html5QrCodeRef.current = null;
          } catch (stopErr) {
            console.error("Error stopping scanner:", stopErr);
          }
          
          setScanning(false);
          setManualMode(true);
          
          // Set token ID and verify
          setTokenId(decodedText.trim());
          console.log("QR Code scanned:", decodedText);
          
          // Automatically verify the scanned token
          await handleVerify(decodedText.trim());
        },
        () => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Failed to start camera: " + (err instanceof Error ? err.message : String(err)));
      setScanning(false);
      setManualMode(true);
      html5QrCodeRef.current = null;
    }
  }

  async function stopScanner() {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
      setScanning(false);
      setManualMode(true);
    } catch (err) {
      console.error("Error stopping scanner:", err);
      setScanning(false);
      setManualMode(true);
      html5QrCodeRef.current = null;
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
              Token ID (format: queueId-tokenId)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 0-5 or just 5"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleVerify()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Verify
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Scan QR code or enter manually
            </p>
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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-green-900 font-bold text-lg">Verified</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-green-800">
              <span className="font-semibold">Queue:</span> {verificationResult.queueName}
            </p>
            <p className="text-green-800">
              <span className="font-semibold">Position:</span> #{verificationResult.tokenId}
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

