"use client";

import { useState, useEffect } from "react";
import { getAllQueues, buildCreateQueueTx, submitTransaction, QueueInfo } from "@/lib/stellar";
import { signTx } from "@/lib/freighter";

interface QueueSelectorProps {
  userAddress: string | null;
  selectedQueueId: number | null;
  onQueueSelect: (queueId: number) => void;
}

export default function QueueSelector({ userAddress, selectedQueueId, onQueueSelect }: QueueSelectorProps) {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadQueues() {
    setLoading(true);
    const allQueues = await getAllQueues();
    setQueues(allQueues);
    
    // Auto-select first queue if none selected
    if (allQueues.length > 0 && selectedQueueId === null) {
      onQueueSelect(allQueues[0].queueId);
    }
    
    setLoading(false);
  }

  async function handleCreateQueue() {
    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!newQueueName.trim()) {
      alert("Please enter a queue name");
      return;
    }

    setCreating(true);
    try {
      // Build transaction
      const txXdr = await buildCreateQueueTx(userAddress, newQueueName);
      
      // Sign with Freighter
      const signedXdr = await signTx(txXdr, userAddress);
      if (!signedXdr) {
        alert("Failed to sign transaction");
        return;
      }

      // Submit transaction
      const result = await submitTransaction(signedXdr);
      
      if (result.status === "SUCCESS") {
        alert(`Queue "${newQueueName}" created successfully!`);
        setNewQueueName("");
        setShowCreateForm(false);
        await loadQueues();
      } else {
        alert("Transaction failed: " + result.status);
      }
    } catch (err) {
      console.error("Create queue error:", err);
      alert("Failed to create queue: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Select Queue</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          {showCreateForm ? "Cancel" : "+ New Queue"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-green-900">Create New Queue</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="Queue name (e.g., 'Coffee Shop Morning')"
              className="flex-1 px-3 py-2 border border-green-300 rounded text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={creating}
            />
            <button
              onClick={handleCreateQueue}
              disabled={creating || !newQueueName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
          {!userAddress && (
            <p className="text-xs text-orange-600">⚠️ Connect your wallet to create a queue</p>
          )}
        </div>
      )}

      {queues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-3">No queues exist yet.</p>
          <p className="text-sm text-gray-500">Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {queues.map((queue) => (
            <button
              key={queue.queueId}
              onClick={() => onQueueSelect(queue.queueId)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selectedQueueId === queue.queueId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{queue.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {queue.tokenCount} {queue.tokenCount === 1 ? "token" : "tokens"}
                  </p>
                </div>
                {selectedQueueId === queue.queueId && (
                  <div className="ml-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedQueueId !== null && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Currently viewing: <span className="font-semibold">{queues.find(q => q.queueId === selectedQueueId)?.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}

