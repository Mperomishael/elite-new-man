// ... rest of existing code ...

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
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

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
  requestedAt: string
  processedAt?: string
  processedBy?: string
}

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  bankDetails?: BankDetails
  lastUpdated: string
  updatedBy: string
}

export async function getAdminBankDetails(): Promise<BankDetails | null> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "wallets"))
    if (settingsDoc.exists()) {
      return (settingsDoc.data() as any).bankDetails || null
    }
    return null
  } catch (error) {
    console.error("[v0] Get bank details error:", error)
    return null
  }
}

export function listenToBankDetails(callback: (details: BankDetails | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "settings", "wallets"), (doc) => {
    if (doc.exists()) {
      callback((doc.data() as any).bankDetails || null)
    } else {
      callback(null)
    }
  })
}

export async function updateAdminWalletSettings(
  settings: Omit<AdminWalletSettings, "lastUpdated">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const walletSettings: AdminWalletSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    }
    await setDoc(doc(db, "settings", "wallets"), walletSettings)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update wallet settings error:", error)
    return { success: false, error: error.message }
  }
}

// ... existing createWithdrawalRequest code ...

export async function createWithdrawalRequest(
  userId: string,
  username: string,
  amount: number,
  crypto: "BTC" | "USDT" | string,
  destination: string,
): Promise<{ success: boolean; error?: string; requestId?: string; newBalance?: number }> {
  try {
    const requestId = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const userDocRef = doc(db, "users", userId)
    const userSnap = await getDoc(userDocRef)

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" }
    }

    const userData = userSnap.data()
    const currentBalance = userData.balance || 0

    if (currentBalance < amount) {
      return { success: false, error: "Insufficient balance" }
    }

    const withdrawalRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto: crypto as "BTC" | "USDT" | "BANK",
      walletAddress: destination,
      status: "pending",
      requestedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "withdrawalRequests", requestId), withdrawalRequest)

    const newBalance = currentBalance - amount
    await setDoc(userDocRef, { balance: newBalance }, { merge: true })

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await setDoc(doc(db, "users", userId, "transactions", transactionId), {
      id: transactionId,
      type: "withdraw",
      amount,
      currency: crypto === "BANK" ? "BANK" : crypto,
      status: "pending",
      timestamp: new Date().toISOString(),
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
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get withdrawal request to find associated transaction
    const withdrawalDoc = await getDoc(doc(db, "withdrawalRequests", requestId))
    if (!withdrawalDoc.exists()) {
      return { success: false, error: "Withdrawal request not found" }
    }

    const withdrawalData = withdrawalDoc.data() as WithdrawalRequest

    // Update withdrawal status to approved
    await updateDoc(doc(db, "withdrawalRequests", requestId), {
      status: "completed",
      processedAt: new Date().toISOString(),
      processedBy: adminId,
    })

    // Update associated transaction to completed
    const transactionsRef = collection(db, "users", withdrawalData.userId, "transactions")
    const q = query(transactionsRef, where("description", "==", `Withdrawal request #${requestId}`))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { status: "completed" })
    })

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve withdrawal error:", error)
    return { success: false, error: error.message }
  }
}

export function listenToWithdrawalStatus(
  userId: string,
  callback: (withdrawals: WithdrawalRequest[]) => void,
): Unsubscribe {
  const q = query(collection(db, "withdrawalRequests"), where("userId", "==", userId))
  return onSnapshot(q, (snapshot) => {
    const withdrawals: WithdrawalRequest[] = []
    snapshot.forEach((doc) => {
      withdrawals.push(doc.data() as WithdrawalRequest)
    })
    callback(withdrawals)
  })
}
