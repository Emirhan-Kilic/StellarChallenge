"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import QueueSelector from "@/components/QueueSelector";
import QueueList from "@/components/QueueList";
import MyToken from "@/components/MyToken";
import Verifier from "@/components/Verifier";
import ActivityFeed from "@/components/ActivityFeed";
import { buildJoinQueueTx, submitTransaction } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "mytoken" | "verifier">("queue");
  const [joining, setJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleJoinQueue() {
    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (selectedQueueId === null) {
      alert("Please select a queue first");
      return;
    }

    setJoining(true);
    try {
      // Build transaction
      const txXdr = await buildJoinQueueTx(userAddress, selectedQueueId);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert("Successfully joined the queue!");
        setRefreshKey((k) => k + 1);
        setActiveTab("mytoken");
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("Join queue error:", err);
      alert("Failed to join queue: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setJoining(false);
    }
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            StellarSkip ⚡
          </h1>
          <p className="text-gray-600 text-lg">
            A Real-Time Market for Physical Queue Spots
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnect
            onConnect={setUserAddress}
            onDisconnect={() => setUserAddress(null)}
          />
        </div>

        {/* Queue Selector */}
        <div className="mb-8">
          <QueueSelector
            userAddress={userAddress}
            selectedQueueId={selectedQueueId}
            onQueueSelect={setSelectedQueueId}
          />
        </div>

        {userAddress && (
          <>
            {/* Join Queue Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleJoinQueue}
                disabled={joining || selectedQueueId === null}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
              >
                {joining ? "Joining Queue..." : "🎫 Join Selected Queue"}
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="bg-white rounded-t-lg shadow-md">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("queue")}
                      className={`flex-1 py-3 px-4 text-center font-medium transition ${
                        activeTab === "queue"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      📋 Queue List
                    </button>
                    <button
                      onClick={() => setActiveTab("mytoken")}
                      className={`flex-1 py-3 px-4 text-center font-medium transition ${
                        activeTab === "mytoken"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      🎟️ My Token
                    </button>
                    <button
                      onClick={() => setActiveTab("verifier")}
                      className={`flex-1 py-3 px-4 text-center font-medium transition ${
                        activeTab === "verifier"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      ✅ Verifier
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-lg shadow-md p-6">
                  {activeTab === "queue" && (
                    <QueueList
                      key={refreshKey}
                      userAddress={userAddress}
                      queueId={selectedQueueId}
                      onRefresh={handleRefresh}
                    />
                  )}
                  {activeTab === "mytoken" && (
                    <MyToken
                      key={refreshKey}
                      userAddress={userAddress}
                      onUpdate={handleRefresh}
                    />
                  )}
                  {activeTab === "verifier" && <Verifier />}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-1">
                <ActivityFeed autoRefresh={true} refreshInterval={5000} />
              </div>
            </div>
          </>
        )}

        {!userAddress && (
          <div className="text-center mt-12 bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600 text-lg">
              Connect your Freighter wallet to get started
            </p>
            <div className="mt-6 text-sm text-gray-500 space-y-2">
              <p>✨ Join a queue and get a tradable NFT</p>
              <p>💰 List your spot for sale or buy a better position</p>
              <p>📱 Verify ownership with QR codes</p>
              <p>🏪 Multiple queues for different venues</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Built on Stellar Testnet • Powered by Soroban Smart Contracts</p>
          <p className="mt-1">
            Contract:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              CB4KYG6XSUXNCTEX7APZ4R3ATJG3XKD7GGCT3EWFESWRCGAX734EQR45
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
