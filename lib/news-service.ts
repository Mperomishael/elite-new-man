import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

export interface TradingNews {
  id: string
  title: string
  description: string
  source: string
  category: "crypto" | "forex" | "stocks" | "market"
  timestamp: string
  symbol?: string
  changePercent?: number
  isRead: boolean
}

export interface UserNotification {
  id: string
  userId: string
  type: "news" | "activity" | "kyc" | "transaction"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  data?: any
}

// Mock trading news data - In production, integrate real API
const mockTradingNews = [
  {
    title: "Bitcoin Surges Past $45,000",
    description: "Bitcoin reaches highest level in months amid market optimism",
    source: "TradingView",
    category: "crypto" as const,
    symbol: "BTC",
    changePercent: 5.2,
  },
  {
    title: "US Dollar Weakens Against Euro",
    description: "EUR/USD breaks above 1.10 level on inflation concerns",
    source: "TradingView",
    category: "forex" as const,
    symbol: "EURUSD",
    changePercent: 2.1,
  },
  {
    title: "S&P 500 Reaches New High",
    description: "Tech stocks lead gains as earnings season heats up",
    source: "TradingView",
    category: "stocks" as const,
    symbol: "SPX",
    changePercent: 1.8,
  },
  {
    title: "Ethereum Breaks Resistance",
    description: "ETH hits $3,000 on growing DeFi adoption",
    source: "TradingView",
    category: "crypto" as const,
    symbol: "ETH",
    changePercent: 4.5,
  },
  {
    title: "Oil Prices Rally",
    description: "Crude oil reaches $85/barrel on supply concerns",
    source: "TradingView",
    category: "market" as const,
    symbol: "CL",
    changePercent: 3.2,
  },
]

// Add trading news notification for user
export async function addTradingNewsNotification(
  userId: string,
  news: Omit<TradingNews, "id" | "isRead" | "timestamp">,
): Promise<{ success: boolean; error?: string; notificationId?: string }> {
  try {
    const notificationRef = await addDoc(collection(db, "users", userId, "notifications"), {
      ...news,
      timestamp: new Date().toISOString(),
      isRead: false,
    })

    // Increment message count
    await incrementMessageCount(userId)

    return { success: true, notificationId: notificationRef.id }
  } catch (error: any) {
    console.error("[v0] Add trading news notification error:", error)
    return { success: false, error: error.message }
  }
}

// Mark notification as read
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId)
    await updateDoc(notificationRef, { isRead: true })
  } catch (error) {
    console.error("[v0] Mark notification as read error:", error)
  }
}

// Get unread notifications count
export function listenToNotifications(userId: string, callback: (notifications: TradingNews[]) => void): Unsubscribe {
  const q = query(collection(db, "users", userId, "notifications"), orderBy("timestamp", "desc"), limit(50))
  return onSnapshot(q, (snapshot) => {
    const notifications: TradingNews[] = []
    snapshot.forEach((doc) => {
      notifications.push({ ...doc.data(), id: doc.id } as TradingNews)
    })
    callback(notifications)
  })
}

// Get unread count
export function listenToUnreadCount(userId: string, callback: (count: number) => void): Unsubscribe {
  const q = query(collection(db, "users", userId, "notifications"), where("isRead", "==", false))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size)
  })
}

// Increment message count
export async function incrementMessageCount(userId: string): Promise<void> {
  try {
    const countRef = doc(db, "users", userId, "metadata", "messageCount")
    await updateDoc(countRef, {
      count: (await getMessageCount(userId)) + 1,
      lastUpdated: new Date().toISOString(),
    }).catch(async () => {
      // If doc doesn't exist, create it
      await updateDoc(countRef, {
        count: 1,
        lastUpdated: new Date().toISOString(),
      })
    })
  } catch (error) {
    console.error("[v0] Increment message count error:", error)
  }
}

// Get current message count
export async function getMessageCount(userId: string): Promise<number> {
  try {
    const { getDoc } = await import("firebase/firestore")
    const countRef = doc(db, "users", userId, "metadata", "messageCount")
    const docSnap = await getDoc(countRef)
    if (docSnap.exists()) {
      return docSnap.data().count || 0
    }
    return 0
  } catch (error) {
    console.error("[v0] Get message count error:", error)
    return 0
  }
}

// Simulate real-time news feed
export function startNewsFeed(userId: string): NodeJS.Timeout {
  return setInterval(async () => {
    const randomNews = mockTradingNews[Math.floor(Math.random() * mockTradingNews.length)]
    await addTradingNewsNotification(userId, {
      title: randomNews.title,
      description: randomNews.description,
      source: randomNews.source,
      category: randomNews.category,
      symbol: randomNews.symbol,
      changePercent: randomNews.changePercent,
      isRead: false,
    })
  }, 45000) // New news every 45 seconds
}

export function stopNewsFeed(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId)
}
