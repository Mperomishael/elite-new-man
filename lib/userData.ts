import { db } from "./firebase"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore"

export interface UserProfile {
  uid: string
  username: string
  email: string
  balance: number
  bonusBalance: number
  country: string
  currency: string
  phone?: string
  kycStatus: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id?: string
  type: "buy" | "sell" | "deposit" | "withdraw" | "transfer"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  timestamp: string
  description: string
  walletAddress?: string
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching user profile:", error)
    return null
  }
}

// Get user transactions from Firestore
export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef)
    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
    })
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }
}

// Update user balance
export async function updateUserBalance(uid: string, newBalance: number): Promise<boolean> {
  try {
    await updateDoc(doc(db, "users", uid), {
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error updating balance:", error)
    return false
  }
}

// Update user bonus balance
export async function updateUserBonusBalance(uid: string, newBonusBalance: number): Promise<boolean> {
  try {
    await updateDoc(doc(db, "users", uid), {
      bonusBalance: newBonusBalance,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error updating bonus balance:", error)
    return false
  }
}

// Add transaction to user's transaction history
export async function addTransaction(uid: string, transaction: Transaction): Promise<boolean> {
  try {
    const transactionsRef = collection(db, "users", uid, "transactions")
    await addDoc(transactionsRef, {
      ...transaction,
      timestamp: transaction.timestamp || new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error adding transaction:", error)
    return false
  }
}

// Get all users (admin function)
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users")
    const querySnapshot = await getDocs(usersRef)
    const users: UserProfile[] = []
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile)
    })
    return users
  } catch (error) {
    console.error("[v0] Error fetching all users:", error)
    return []
  }
}

// Update user profile (admin function)
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    return false
  }
}

// Get user transactions by type
export async function getUserTransactionsByType(uid: string, type: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef, where("type", "==", type))
    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
    })
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("[v0] Error fetching transactions by type:", error)
    return []
  }
}

// Deduct funds from user balance
export async function deductUserBalance(uid: string, amount: number): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return false

    const newBalance = userProfile.balance - amount
    if (newBalance < 0) return false

    return await updateUserBalance(uid, newBalance)
  } catch (error) {
    console.error("[v0] Error deducting balance:", error)
    return false
  }
}

// Add funds to user balance
export async function addFundsToUser(uid: string, amount: number): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return false

    const newBalance = userProfile.balance + amount
    return await updateUserBalance(uid, newBalance)
  } catch (error) {
    console.error("[v0] Error adding funds:", error)
    return false
  }
}

// Add bonus to user
export async function addBonusToUser(uid: string, amount: number): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return false

    const newBonusBalance = userProfile.bonusBalance + amount
    return await updateUserBonusBalance(uid, newBonusBalance)
  } catch (error) {
    console.error("[v0] Error adding bonus:", error)
    return false
  }
}
