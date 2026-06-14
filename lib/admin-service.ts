// admin-service.ts
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import type { UserProfile, Transaction } from "./auth-service"
export type { Transaction }

// -------------------------
// INTERFACES
// -------------------------

export interface BankDetails {
  bankName: string
  accountHolderName: string
  accountNumber: string
  routingNumber?: string
  swiftCode?: string
  iban?: string
  country: string
}

export interface WithdrawalRequest {
  id: string
  userId: string
  username: string
  amount: number
  crypto: "BTC" | "USDT" | "ETH" | "BANK" | string
  walletAddress: string
  status: "pending" | "approved" | "rejected" | "completed"
  requestedAt: Timestamp
  processedAt?: Timestamp
  processedBy?: string
}

export interface DepositRequest {
  id: string
  transactionId: string
  userId: string
  username: string
  amount: number
  currency: "BTC" | "USDT" | "XRP" | "ETH" | "BANK"
  proofScreenshot: string
  status: "pending" | "completed" | "rejected"
  requestedAt: Timestamp
  processedAt?: Timestamp
  processedBy?: string
}

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  xrpAddress: string
  xrpTag: string
  ethAddress: string
  ethTag: string
  bankDetails?: BankDetails
  whatsappNumber?: string
  supportPhone?: string
  lastUpdated: Timestamp
  updatedBy: string
}

// -------------------------
// ADMIN CHECK
// -------------------------

// Centralized list of approved admin emails (verified Google accounts only)
export const ADMIN_EMAILS = [
  "empiredigitalsworldwide@gmail.com",
  "bigdrem35@gmail.com",
]

export async function isAdminByEmail(email: string): Promise<boolean> {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)
}

// -------------------------
// ADMIN RECORD
// -------------------------

export async function createAdminRecord(
  userId: string,
  email: string,
  displayName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminRecord = {
      userId,
      email,
      displayName: displayName || email,
      createdAt: Timestamp.now(),
      role: "admin",
    }
    await setDoc(doc(db, "admins", userId), adminRecord)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Create admin record error:", error)
    return { success: false, error: error.message }
  }
}

// -------------------------
// WALLET SETTINGS
// -------------------------

export async function getAdminWalletSettings(): Promise<AdminWalletSettings | null> {
  try {
    const docSnap = await getDoc(doc(db, "settings", "wallets"))
    if (!docSnap.exists()) return null
    return docSnap.data() as AdminWalletSettings
  } catch (error) {
    console.error("[v0] Get admin wallet settings error:", error)
    return null
  }
}

export async function updateAdminWalletSettings(
  settings: Omit<AdminWalletSettings, "lastUpdated">
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatedSettings: AdminWalletSettings = {
      ...settings,
      lastUpdated: Timestamp.now(),
    }
    await setDoc(doc(db, "settings", "wallets"), updatedSettings)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update wallet settings error:", error)
    return { success: false, error: error.message }
  }
}

// Real-time listener for bank details
export function listenToBankDetails(callback: (details: BankDetails | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "settings", "wallets"), (snap) => {
    callback(snap.exists() ? (snap.data() as any).bankDetails || null : null)
  })
}

// -------------------------
// WITHDRAWAL REQUESTS
// -------------------------

export async function createWithdrawalRequest(
  userId: string,
  username: string,
  amount: number,
  crypto: "BTC" | "USDT" | string,
  destination: string
): Promise<{ success: boolean; error?: string; requestId?: string; newBalance?: number }> {
  try {
    const requestId = `WD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return { success: false, error: "User not found" }

    const userData = userSnap.data() as UserProfile
    if ((userData.balance || 0) < amount) return { success: false, error: "Insufficient balance" }

    const withdrawal: WithdrawalRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto: crypto as "BTC" | "USDT" | "BANK",
      walletAddress: destination,
      status: "pending",
      requestedAt: Timestamp.now(),
    }

    await setDoc(doc(db, "withdrawalRequests", requestId), withdrawal)

    const newBalance = userData.balance - amount
    await setDoc(userRef, { balance: newBalance }, { merge: true })

    // Add transaction
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    await setDoc(doc(db, "users", userId, "transactions", txnId), {
      id: txnId,
      type: "withdraw",
      amount,
      currency: crypto === "BANK" ? "BANK" : crypto,
      status: "pending",
      timestamp: Timestamp.now(),
      description: `Withdrawal request #${requestId}`,
    })

    return { success: true, requestId, newBalance }
  } catch (error: any) {
    console.error("[v0] Create withdrawal request error:", error)
    return { success: false, error: error.message }
  }
}

export async function approveWithdrawal(
  requestId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const wdRef = doc(db, "withdrawalRequests", requestId)
    const wdSnap = await getDoc(wdRef)
    if (!wdSnap.exists()) return { success: false, error: "Withdrawal request not found" }

    const wdData = wdSnap.data() as WithdrawalRequest
    await updateDoc(wdRef, { status: "completed", processedAt: Timestamp.now(), processedBy: adminId })

    // Update user transactions
    const txnRef = collection(db, "users", wdData.userId, "transactions")
    const q = query(txnRef, where("description", "==", `Withdrawal request #${requestId}`))
    const snapshot = await getDocs(q)
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "users", wdData.userId, "transactions", docSnap.id), { status: "completed" })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve withdrawal error:", error)
    return { success: false, error: error.message }
  }
}

// Real-time listener for withdrawal requests of a user
export function listenToWithdrawalStatus(userId: string, callback: (withdrawals: WithdrawalRequest[]) => void): Unsubscribe {
  const q = query(collection(db, "withdrawalRequests"), where("userId", "==", userId))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data() as WithdrawalRequest)))
}

// -------------------------
// DEPOSIT REQUESTS
// -------------------------

export async function createDepositRequest(
  userId: string,
  username: string,
  amount: number,
  currency: "BTC" | "USDT" | "XRP" | "BANK",
  proofScreenshot: string
): Promise<{ success: boolean; error?: string; requestId?: string; transactionId?: string }> {
  try {
    const requestId = `DEPOSIT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const deposit: DepositRequest = {
      id: requestId,
      transactionId,
      userId,
      username,
      amount,
      currency,
      proofScreenshot,
      status: "pending",
      requestedAt: Timestamp.now(),
    }

    await setDoc(doc(db, "depositRequests", requestId), deposit)

    // Add transaction with transaction ID
    await setDoc(doc(db, "users", userId, "transactions", transactionId), {
      id: transactionId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      timestamp: Timestamp.now(),
      description: `Deposit request #${requestId}`,
      receiptUrl: proofScreenshot,
    })

    return { success: true, requestId, transactionId }
  } catch (error: any) {
    console.error("[v0] Create deposit request error:", error)
    return { success: false, error: error.message }
  }
}

export async function approveDeposit(
  requestId: string,
  adminId: string,
  creditAmount?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const depRef = doc(db, "depositRequests", requestId)
    const depSnap = await getDoc(depRef)
    if (!depSnap.exists()) return { success: false, error: "Deposit request not found" }

    const depData = depSnap.data() as DepositRequest
    const amount = creditAmount ?? depData.amount

    await updateDoc(depRef, { status: "completed", processedAt: Timestamp.now(), processedBy: adminId })

    const userRef = doc(db, "users", depData.userId)
    const userSnap = await getDoc(userRef)
    const currentBalance = userSnap.exists() ? (userSnap.data() as any).balance || 0 : 0
    await setDoc(userRef, { balance: currentBalance + amount }, { merge: true })

    // Update user transactions
    const txnRef = collection(db, "users", depData.userId, "transactions")
    const q = query(txnRef, where("description", "==", `Deposit request #${requestId}`))
    const snapshot = await getDocs(q)
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "users", depData.userId, "transactions", docSnap.id), { status: "completed" })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve deposit error:", error)
    return { success: false, error: error.message }
  }
}

export async function rejectDeposit(
  requestId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const depRef = doc(db, "depositRequests", requestId)
    const depSnap = await getDoc(depRef)
    if (!depSnap.exists()) return { success: false, error: "Deposit request not found" }

    const depData = depSnap.data() as DepositRequest
    await updateDoc(depRef, { status: "rejected", processedAt: Timestamp.now(), processedBy: adminId })

    // Update user transactions to rejected
    const txnRef = collection(db, "users", depData.userId, "transactions")
    const q = query(txnRef, where("description", "==", `Deposit request #${requestId}`))
    const snapshot = await getDocs(q)
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "users", depData.userId, "transactions", docSnap.id), { status: "rejected" })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject deposit error:", error)
    return { success: false, error: error.message }
  }
}

// Real-time listener for deposit requests
export function listenToDepositRequests(callback: (deposits: DepositRequest[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "depositRequests"), (snap) => callback(snap.docs.map((d) => d.data() as DepositRequest)))
}
