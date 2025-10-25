import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  lastUpdated: string
  updatedBy: string
}

export interface WithdrawalRequest {
  id: string
  userId: string
  username: string
  amount: number
  crypto: "BTC" | "USDT"
  walletAddress: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  processedAt?: string
  processedBy?: string
}

export interface DepositRequest {
  id: string
  userId: string
  username: string
  amount: number
  crypto: "BTC" | "USDT"
  screenshot: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  processedAt?: string
  processedBy?: string
}

export interface KYCDocument {
  userId: string
  username: string
  documentUrl: string
  uploadedAt: string
  status: "pending" | "approved" | "rejected"
}

// Check if user is admin by email
const ADMIN_EMAILS = ["ultimatestckstrade@gmail.com", "empiredigitalsworldwide@gmail.com"]

export async function isAdminByEmail(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Check if user is admin
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const adminDoc = await getDoc(doc(db, "admins", uid))
    return adminDoc.exists()
  } catch (error) {
    console.error("[v0] Check admin error:", error)
    return false
  }
}

export async function createAdminRecord(uid: string, email: string): Promise<void> {
  try {
    await setDoc(doc(db, "admins", uid), {
      email,
      createdAt: new Date().toISOString(),
      role: "admin",
    })
  } catch (error) {
    console.error("[v0] Create admin record error:", error)
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
    console.error("[v0] Get wallet settings error:", error)
    return null
  }
}

// Update admin wallet settings
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

// Create withdrawal request
export async function createWithdrawalRequest(
  userId: string,
  username: string,
  amount: number,
  crypto: "BTC" | "USDT",
  walletAddress: string,
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const requestId = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const withdrawalRequest: WithdrawalRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto,
      walletAddress,
      status: "pending",
      requestedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "withdrawalRequests", requestId), withdrawalRequest)
    return { success: true, requestId }
  } catch (error: any) {
    console.error("[v0] Create withdrawal request error:", error)
    return { success: false, error: error.message }
  }
}

// Create deposit request
export async function createDepositRequest(
  userId: string,
  username: string,
  amount: number,
  crypto: "BTC" | "USDT",
  screenshot: string,
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const requestId = `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const depositRequest: DepositRequest = {
      id: requestId,
      userId,
      username,
      amount,
      crypto,
      screenshot,
      status: "pending",
      requestedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "depositRequests", requestId), depositRequest)
    return { success: true, requestId }
  } catch (error: any) {
    console.error("[v0] Create deposit request error:", error)
    return { success: false, error: error.message }
  }
}

// Get pending withdrawal requests (admin only)
export async function getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  try {
    const q = query(collection(db, "withdrawalRequests"), where("status", "==", "pending"))
    const querySnapshot = await getDocs(q)
    const requests: WithdrawalRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push(doc.data() as WithdrawalRequest)
    })
    return requests
  } catch (error) {
    console.error("[v0] Get pending withdrawals error:", error)
    return []
  }
}

// Get pending deposit requests (admin only)
export async function getPendingDeposits(): Promise<DepositRequest[]> {
  try {
    const q = query(collection(db, "depositRequests"), where("status", "==", "pending"))
    const querySnapshot = await getDocs(q)
    const requests: DepositRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push(doc.data() as DepositRequest)
    })
    return requests
  } catch (error) {
    console.error("[v0] Get pending deposits error:", error)
    return []
  }
}

// Approve withdrawal request (admin only)
export async function approveWithdrawal(
  requestId: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "withdrawalRequests", requestId), {
      status: "approved",
      processedAt: new Date().toISOString(),
      processedBy: adminId,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve withdrawal error:", error)
    return { success: false, error: error.message }
  }
}

// Approve deposit request (admin only)
export async function approveDeposit(
  requestId: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "depositRequests", requestId), {
      status: "approved",
      processedAt: new Date().toISOString(),
      processedBy: adminId,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve deposit error:", error)
    return { success: false, error: error.message }
  }
}

// Reject withdrawal request (admin only)
export async function rejectWithdrawal(
  requestId: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "withdrawalRequests", requestId), {
      status: "rejected",
      processedAt: new Date().toISOString(),
      processedBy: adminId,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject withdrawal error:", error)
    return { success: false, error: error.message }
  }
}

// Reject deposit request (admin only)
export async function rejectDeposit(requestId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "depositRequests", requestId), {
      status: "rejected",
      processedAt: new Date().toISOString(),
      processedBy: adminId,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject deposit error:", error)
    return { success: false, error: error.message }
  }
}

// Get all withdrawal requests
export async function getAllWithdrawals(): Promise<WithdrawalRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "withdrawalRequests"))
    const requests: WithdrawalRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push(doc.data() as WithdrawalRequest)
    })
    return requests
  } catch (error) {
    console.error("[v0] Get all withdrawals error:", error)
    return []
  }
}

// Get all deposit requests
export async function getAllDeposits(): Promise<DepositRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "depositRequests"))
    const requests: DepositRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push(doc.data() as DepositRequest)
    })
    return requests
  } catch (error) {
    console.error("[v0] Get all deposits error:", error)
    return []
  }
}

export async function addKYCDocument(
  userId: string,
  username: string,
  documentUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const docId = `KYC-${userId}-${Date.now()}`
    const kycDoc: KYCDocument = {
      userId,
      username,
      documentUrl,
      uploadedAt: new Date().toISOString(),
      status: "pending",
    }
    await setDoc(doc(db, "kycDocuments", docId), kycDoc)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Add KYC document error:", error)
    return { success: false, error: error.message }
  }
}

export async function getKYCDocuments(userId?: string): Promise<KYCDocument[]> {
  try {
    let q
    if (userId) {
      q = query(collection(db, "kycDocuments"), where("userId", "==", userId))
    } else {
      q = query(collection(db, "kycDocuments"))
    }
    const querySnapshot = await getDocs(q)
    const docs: KYCDocument[] = []
    querySnapshot.forEach((doc) => {
      docs.push(doc.data() as KYCDocument)
    })
    return docs
  } catch (error) {
    console.error("[v0] Get KYC documents error:", error)
    return []
  }
}
