"use client"

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
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// ------------------ Interfaces ------------------

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
  crypto: "BTC" | "USDT" | "BANK" | string
  walletAddress: string
  status: "pending" | "approved" | "rejected" | "completed"
  requestedAt: any
  processedAt?: any
  processedBy?: string
}

export interface DepositRequest {
  id: string
  userId: string
  username: string
  amount: number
  currency: "BTC" | "USDT" | "BANK"
  proofScreenshot: string
  status: "pending" | "completed"
  requestedAt: any
  processedAt?: any
  processedBy?: string
}

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  bankDetails?: BankDetails
  lastUpdated: any
  updatedBy: string
}

// ------------------ Admin Utilities ------------------

export async function isAdminByEmail(email: string): Promise<boolean> {
  const adminEmails = ["ultimatestckstrade@gmail.com", "empiredigitalsworldwide@gmail.com"]
  return adminEmails.includes(email)
}

export async function createAdminRecord(
  userId: string,
  email: string,
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminRecord = {
      userId,
      email,
      displayName,
      createdAt: serverTimestamp(),
      role: "admin",
    }
    await setDoc(doc(db, "admins", userId), adminRecord)
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Create admin record error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Wallet Settings ------------------

export async function getAdminWalletSettings(): Promise<AdminWalletSettings | null> {
  try {
    const docSnap = await getDoc(doc(db, "settings", "wallets"))
    return docSnap.exists() ? (docSnap.data() as AdminWalletSettings) : null
  } catch (err) {
    console.error("[v0] Get wallet settings error:", err)
    return null
  }
}

export function listenToBankDetails(callback: (details: BankDetails | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "settings", "wallets"), (snap) => {
    callback(snap.exists() ? (snap.data() as any).bankDetails || null : null)
  })
}

export async function updateAdminWalletSettings(
  settings: Omit<AdminWalletSettings, "lastUpdated">
): Promise<{ success: boolean; error?: string }> {
  try {
    await setDoc(doc(db, "settings", "wallets"), { ...settings, lastUpdated: serverTimestamp() })
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Update wallet settings error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Withdrawal Requests ------------------

export async function createWithdrawalRequest(
  userId: string,
  username: string,
  amount: number,
  crypto: "BTC" | "USDT" | string,
  destination: string
): Promise<{ success: boolean; error?: string; requestId?: string; newBalance?: number }> {
  try {
    const requestId = `WD-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return { success: false, error: "User not found" }

    const currentBalance = (userSnap.data() as any).balance || 0
    if (currentBalance < amount) return { success: false, error: "Insufficient balance" }

    const withdrawalRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto: crypto as "BTC" | "USDT" | "BANK",
      walletAddress: destination,
      status: "pending",
      requestedAt: serverTimestamp(),
    }

    await setDoc(doc(db, "withdrawalRequests", requestId), withdrawalRequest)
    const newBalance = currentBalance - amount
    await setDoc(userRef, { balance: newBalance }, { merge: true })

    // Add transaction
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    await setDoc(doc(db, "users", userId, "transactions", txnId), {
      id: txnId,
      type: "withdraw",
      amount,
      currency: crypto === "BANK" ? "BANK" : crypto,
      status: "pending",
      timestamp: serverTimestamp(),
      description: `Withdrawal request #${requestId}`,
    })

    return { success: true, requestId, newBalance }
  } catch (err: any) {
    console.error("[v0] Create withdrawal request error:", err)
    return { success: false, error: err.message }
  }
}

export async function approveWithdrawal(requestId: string, adminId: string) {
  try {
    const withdrawalRef = doc(db, "withdrawalRequests", requestId)
    const withdrawalSnap = await getDoc(withdrawalRef)
    if (!withdrawalSnap.exists()) return { success: false, error: "Request not found" }

    const data = withdrawalSnap.data() as WithdrawalRequest
    await updateDoc(withdrawalRef, { status: "completed", processedAt: serverTimestamp(), processedBy: adminId })

    // Update corresponding transactions
    const txnsRef = collection(db, "users", data.userId, "transactions")
    const q = query(txnsRef, where("description", "==", `Withdrawal request #${requestId}`))
    const snapshot = await getDocs(q)
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "users", data.userId, "transactions", docSnap.id), { status: "completed" })
    }

    return { success: true }
  } catch (err: any) {
    console.error("[v0] Approve withdrawal error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Deposit Requests ------------------

export async function createDepositRequest(
  userId: string,
  username: string,
  amount: number,
  currency: "BTC" | "USDT" | "BANK",
  proofScreenshot: string
) {
  try {
    const requestId = `DEPOSIT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const depositRequest: DepositRequest = {
      id: requestId,
      userId,
      username,
      amount,
      currency,
      proofScreenshot,
      status: "pending",
      requestedAt: serverTimestamp(),
    }
    await setDoc(doc(db, "depositRequests", requestId), depositRequest)

    // Add transaction
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    await setDoc(doc(db, "users", userId, "transactions", txnId), {
      id: txnId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      timestamp: serverTimestamp(),
      description: `Deposit request #${requestId}`,
    })

    return { success: true, requestId }
  } catch (err: any) {
    console.error("[v0] Create deposit request error:", err)
    return { success: false, error: err.message }
  }
}

export async function approveDeposit(requestId: string, adminId: string, creditAmount?: number) {
  try {
    const depositRef = doc(db, "depositRequests", requestId)
    const depositSnap = await getDoc(depositRef)
    if (!depositSnap.exists()) return { success: false, error: "Deposit request not found" }

    const data = depositSnap.data() as DepositRequest
    const amount = creditAmount ?? data.amount

    await updateDoc(depositRef, { status: "completed", processedAt: serverTimestamp(), processedBy: adminId })

    const userRef = doc(db, "users", data.userId)
    const userSnap = await getDoc(userRef)
    const currentBalance = userSnap.exists() ? (userSnap.data() as any).balance || 0 : 0
    await setDoc(userRef, { balance: currentBalance + amount }, { merge: true })

    // Update transactions
    const txnsRef = collection(db, "users", data.userId, "transactions")
    const q = query(txnsRef, where("description", "==", `Deposit request #${requestId}`))
    const snapshot = await getDocs(q)
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "users", data.userId, "transactions", docSnap.id), { status: "completed" })
    }

    return { success: true }
  } catch (err: any) {
    console.error("[v0] Approve deposit error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Real-time Listeners ------------------

export function listenToDepositRequests(callback: (deposits: DepositRequest[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "depositRequests"), (snap) => {
    callback(snap.docs.map((d) => d.data() as DepositRequest))
  })
}

export function listenToWithdrawalStatus(userId: string, callback: (withdrawals: WithdrawalRequest[]) => void): Unsubscribe {
  const q = query(collection(db, "withdrawalRequests"), where("userId", "==", userId))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data() as WithdrawalRequest)))
}
