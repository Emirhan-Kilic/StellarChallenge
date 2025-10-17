"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  getActivityHistory, 
  detectActivities, 
  initializeActivityTracker,
  getActivityIcon,
  getActivityColor,
  getActivityMessage
} from "@/lib/activityTracker";

interface ActivityFeedProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function ActivityFeed({ 
  autoRefresh = true, 
  refreshInterval = 5000 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const activityListRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(0);

  // Initialize tracker
  useEffect(() => {
    async function init() {
      await initializeActivityTracker();
      setIsInitialized(true);
      const history = getActivityHistory();
      setActivities(history);
      previousCountRef.current = history.length;
    }
    init();
  }, []);

  // Poll for new activities
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    const interval = setInterval(async () => {
      const newActivities = await detectActivities();
      if (newActivities.length > 0) {
        const allActivities = getActivityHistory();
        setActivities(allActivities);
        
        // Update new activity count
        if (isLive) {
          setNewActivityCount(prev => prev + newActivities.length);
          // Auto-scroll to top if live
          if (activityListRef.current) {
            activityListRef.current.scrollTop = 0;
          }
        }
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isLive, isInitialized]);

  // Reset new count when viewing
  useEffect(() => {
    if (isLive && newActivityCount > 0) {
      const timeout = setTimeout(() => setNewActivityCount(0), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isLive, newActivityCount]);

  function toggleLive() {
    setIsLive(!isLive);
    setNewActivityCount(0);
  }

  function getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
  };

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">📡</span>
              {isLive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">Live Activity Feed</h2>
              <p className="text-xs text-blue-100">
                {isLive ? "Real-time updates" : "Paused"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {newActivityCount > 0 && (
              <div className="animate-bounce bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                +{newActivityCount} new
              </div>
            )}
            <button
              onClick={toggleLive}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isLive
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isLive ? "⏸ Pause" : "▶ Resume"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div 
        ref={activityListRef}
        className="max-h-96 overflow-y-auto p-4 space-y-2"
      >
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👀</div>
            <p className="text-lg font-medium">No activity yet</p>
            <p className="text-sm mt-2">
              Start trading to see live updates here!
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const color = getActivityColor(activity.type);
            const icon = getActivityIcon(activity.type);
            const message = getActivityMessage(activity);
            const isNew = index < newActivityCount;

            return (
              <div
                key={activity.id}
                className={`border rounded-lg p-3 transition-all duration-300 ${
                  colorClasses[color as keyof typeof colorClasses]
                } ${isNew ? "animate-pulse" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    iconColorClasses[color as keyof typeof iconColorClasses]
                  }`}>
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold">
                        {activity.queueName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      {isNew && (
                        <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-bold animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-center">
        <p className="text-xs text-gray-600">
          {activities.length > 0 ? (
            <>
              Showing {activities.length} recent{" "}
              {activities.length === 1 ? "activity" : "activities"}
            </>
          ) : (
            "Waiting for marketplace activity..."
          )}
        </p>
      </div>
    </div>
  );
}

