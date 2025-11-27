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
  requestedAt: Timestamp
  processedAt?: Timestamp
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
  requestedAt: Timestamp
  processedAt?: Timestamp
  processedBy?: string
}

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  bankDetails?: BankDetails
  lastUpdated: Timestamp
  updatedBy: string
}

// Admin email check
export async function isAdminByEmail(email: string): Promise<boolean> {
  const adminEmails = ["ultimatestckstrade@gmail.com", "empiredigitalsworldwide@gmail.com"]
  return adminEmails.includes(email)
}

// Create admin record
export async function createAdminRecord(
  userId: string,
  email: string,
  displayName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminRecord = {
      userId,
      email,
      displayName,
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

// Get admin wallet settings
export async function getAdminWalletSettings(): Promise<AdminWalletSettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "wallets"))
    if (settingsDoc.exists()) {
      return settingsDoc.data() as AdminWalletSettings
    }
    return null
  } catch (error) {
    console.error("[v0] Get admin wallet settings error:", error)
    return null
  }
}

// Listen to bank details in real time
export function listenToBankDetails(callback: (details: BankDetails | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "settings", "wallets"), (snap) => {
    if (snap.exists()) {
      callback((snap.data() as any).bankDetails || null)
    } else {
      callback(null)
    }
  })
}

// Update wallet settings
export async function updateAdminWalletSettings(
  settings: Omit<AdminWalletSettings, "lastUpdated">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const walletSettings: AdminWalletSettings = {
      ...settings,
      lastUpdated: Timestamp.now(),
    }
    await setDoc(doc(db, "settings", "wallets"), walletSettings)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update wallet settings error:", error)
    return { success: false, error: error.message }
  }
}

// Create withdrawal request
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

    if (!userSnap.exists()) return { success: false, error: "User not found" }

    const userData = userSnap.data()
    const currentBalance = userData?.balance || 0
    if (currentBalance < amount) return { success: false, error: "Insufficient balance" }

    const withdrawalRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto: crypto as "BTC" | "USDT" | "BANK",
      walletAddress: destination,
      status: "pending",
      requestedAt: Timestamp.now(),
    }

    await setDoc(doc(db, "withdrawalRequests", requestId), withdrawalRequest)
    const newBalance = currentBalance - amount
    await setDoc(userDocRef, { balance: newBalance }, { merge: true })

    // Add transaction
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await setDoc(doc(db, "users", userId, "transactions", transactionId), {
      id: transactionId,
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

// Approve withdrawal
export async function approveWithdrawal(
  requestId: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawalDocRef = doc(db, "withdrawalRequests", requestId)
    const withdrawalDoc = await getDoc(withdrawalDocRef)
    if (!withdrawalDoc.exists()) return { success: false, error: "Withdrawal request not found" }

    const withdrawalData = withdrawalDoc.data() as WithdrawalRequest
    await updateDoc(withdrawalDocRef, {
      status: "completed",
      processedAt: Timestamp.now(),
      processedBy: adminId,
    })

    // Update user transactions
    const transactionsRef = collection(db, "users", withdrawalData.userId, "transactions")
    const q = query(transactionsRef, where("description", "==", `Withdrawal request #${requestId}`))
    const querySnapshot = await getDocs(q)
    for (const d of querySnapshot.docs) {
      await updateDoc(doc(db, "users", withdrawalData.userId, "transactions", d.id), {
        status: "completed",
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve withdrawal error:", error)
    return { success: false, error: error.message }
  }
}

// Create deposit request
export async function createDepositRequest(
  userId: string,
  username: string,
  amount: number,
  currency: "BTC" | "USDT" | "BANK",
  proofScreenshot: string,
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const requestId = `DEPOSIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const depositRequest: DepositRequest = {
      id: requestId,
      userId,
      username,
      amount,
      currency,
      proofScreenshot,
      status: "pending",
      requestedAt: Timestamp.now(),
    }
    await setDoc(doc(db, "depositRequests", requestId), depositRequest)

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await setDoc(doc(db, "users", userId, "transactions", transactionId), {
      id: transactionId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      timestamp: Timestamp.now(),
      description: `Deposit request #${requestId}`,
    })

    return { success: true, requestId }
  } catch (error: any) {
    console.error("[v0] Create deposit request error:", error)
    return { success: false, error: error.message }
  }
}

// Approve deposit
export async function approveDeposit(
  requestId: string,
  adminId: string,
  creditAmount?: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const depositDocRef = doc(db, "depositRequests", requestId)
    const depositDoc = await getDoc(depositDocRef)
    if (!depositDoc.exists()) return { success: false, error: "Deposit request not found" }

    const depositData = depositDoc.data() as DepositRequest
    const amount = creditAmount ?? depositData.amount

    await updateDoc(depositDocRef, {
      status: "completed",
      processedAt: Timestamp.now(),
      processedBy: adminId,
    })

    const userDocRef = doc(db, "users", depositData.userId)
    const userSnap = await getDoc(userDocRef)
    const currentBalance = userSnap.exists() ? (userSnap.data() as any).balance || 0 : 0
    const newBalance = currentBalance + amount
    await setDoc(userDocRef, { balance: newBalance }, { merge: true })

    // Update user transactions
    const transactionsRef = collection(db, "users", depositData.userId, "transactions")
    const q = query(transactionsRef, where("description", "==", `Deposit request #${requestId}`))
    const querySnapshot = await getDocs(q)
    for (const d of querySnapshot.docs) {
      await updateDoc(doc(db, "users", depositData.userId, "transactions", d.id), {
        status: "completed",
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve deposit error:", error)
    return { success: false, error: error.message }
  }
}

// Real-time listeners
export function listenToDepositRequests(callback: (deposits: DepositRequest[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "depositRequests"), (snapshot) => {
    const deposits: DepositRequest[] = snapshot.docs.map((doc) => doc.data() as DepositRequest)
    callback(deposits)
  })
}

export function listenToWithdrawalStatus(
  userId: string,
  callback: (withdrawals: WithdrawalRequest[]) => void,
): Unsubscribe {
  const q = query(collection(db, "withdrawalRequests"), where("userId", "==", userId))
  return onSnapshot(q, (snapshot) => {
    const withdrawals: WithdrawalRequest[] = snapshot.docs.map((doc) => doc.data() as WithdrawalRequest)
    callback(withdrawals)
  })
}
