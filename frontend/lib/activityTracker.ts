import { getQueueData, getAllQueues, QueueToken } from "./stellar";

export interface Activity {
  id: string;
  type: "join" | "list" | "sale" | "cancel";
  timestamp: number;
  queueId: number;
  queueName: string;
  tokenId: number;
  owner: string;
  price?: string;
  buyer?: string;
}

// Store previous state to detect changes
const previousState: Map<string, QueueToken[]> = new Map();
let activityHistory: Activity[] = [];
let activityIdCounter = 0;

// Generate unique activity ID
function generateActivityId(): string {
  return `activity-${Date.now()}-${activityIdCounter++}`;
}

// Compare states and detect activities
export async function detectActivities(): Promise<Activity[]> {
  try {
    const queues = await getAllQueues();
    const newActivities: Activity[] = [];

    for (const queue of queues) {
      const currentTokens = await getQueueData(queue.queueId);
      const previousTokens = previousState.get(`queue-${queue.queueId}`) || [];
      
      // Detect new joins
      if (currentTokens.length > previousTokens.length) {
        const newTokens = currentTokens.slice(previousTokens.length);
        for (const token of newTokens) {
          newActivities.push({
            id: generateActivityId(),
            type: "join",
            timestamp: Date.now(),
            queueId: queue.queueId,
            queueName: queue.name,
            tokenId: token.tokenId,
            owner: token.owner,
          });
        }
      }

      // Detect listings, sales, and cancellations
      for (let i = 0; i < Math.min(currentTokens.length, previousTokens.length); i++) {
        const current = currentTokens[i];
        const previous = previousTokens[i];

        if (!previous) continue;

        // Detect new listing
        if (!previous.isForSale && current.isForSale) {
          newActivities.push({
            id: generateActivityId(),
            type: "list",
            timestamp: Date.now(),
            queueId: queue.queueId,
            queueName: queue.name,
            tokenId: current.tokenId,
            owner: current.owner,
            price: current.price,
          });
        }

        // Detect sale (owner changed while price exists or existed)
        if (previous.owner !== current.owner) {
          newActivities.push({
            id: generateActivityId(),
            type: "sale",
            timestamp: Date.now(),
            queueId: queue.queueId,
            queueName: queue.name,
            tokenId: current.tokenId,
            owner: previous.owner,
            buyer: current.owner,
            price: previous.price,
          });
        }

        // Detect cancellation
        if (previous.isForSale && !current.isForSale && previous.owner === current.owner) {
          newActivities.push({
            id: generateActivityId(),
            type: "cancel",
            timestamp: Date.now(),
            queueId: queue.queueId,
            queueName: queue.name,
            tokenId: current.tokenId,
            owner: current.owner,
            price: previous.price,
          });
        }
      }

      // Update previous state
      previousState.set(`queue-${queue.queueId}`, currentTokens);
    }

    // Add to history (keep last 100 activities)
    activityHistory = [...newActivities, ...activityHistory].slice(0, 100);

    return newActivities;
  } catch (error) {
    console.error("Error detecting activities:", error);
    return [];
  }
}

// Get all activities
export function getActivityHistory(): Activity[] {
  return activityHistory;
}

// Initialize state without generating activities
export async function initializeActivityTracker(): Promise<void> {
  try {
    const queues = await getAllQueues();
    for (const queue of queues) {
      const tokens = await getQueueData(queue.queueId);
      previousState.set(`queue-${queue.queueId}`, tokens);
    }
  } catch (error) {
    console.error("Error initializing activity tracker:", error);
  }
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address) return "Unknown";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Format price for display
export function formatPrice(price?: string): string {
  if (!price || price === "0") return "N/A";
  return `${(parseInt(price) / 10000000).toFixed(2)} XLM`;
}

// Get activity icon
export function getActivityIcon(type: Activity["type"]): string {
  switch (type) {
    case "join":
      return "👋";
    case "list":
      return "💰";
    case "sale":
      return "🎉";
    case "cancel":
      return "❌";
  }
}

// Get activity color
export function getActivityColor(type: Activity["type"]): string {
  switch (type) {
    case "join":
      return "blue";
    case "list":
      return "green";
    case "sale":
      return "purple";
    case "cancel":
      return "orange";
  }
}

// Get activity message
export function getActivityMessage(activity: Activity): string {
  const owner = formatAddress(activity.owner);
  const price = formatPrice(activity.price);
  
  switch (activity.type) {
    case "join":
      return `${owner} joined position #${activity.tokenId}`;
    case "list":
      return `${owner} listed position #${activity.tokenId} for ${price}`;
    case "sale":
      const buyer = formatAddress(activity.buyer || "");
      return `${buyer} bought position #${activity.tokenId} from ${owner} for ${price}`;
    case "cancel":
      return `${owner} cancelled listing for position #${activity.tokenId}`;
  }
}

