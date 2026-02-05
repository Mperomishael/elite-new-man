// auth-service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { Transaction } from "./admin-service"

export { auth }

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  currency: string
  country: string
  balance: number
  profitBalance: number
  kycDocuments: string[]
  kycStatus: "pending" | "approved" | "rejected"
  createdAt: Timestamp
  displayName: string
}

// -------------------------
// USER PROFILE
// -------------------------

export async function createUserProfile(
  user: User,
  profileData: Omit<UserProfile, "uid" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName">
) {
  const isAdmin = user.email === "ultimatestckstrade@gmail.com" || user.email === "empiredigitalsworldwide@gmail.com"

  const userProfile: UserProfile = {
    uid: user.uid,
    ...profileData,
    balance: isAdmin ? 100000000000 : 0,
    profitBalance: 0,
    kycDocuments: [],
    kycStatus: "pending",
    createdAt: Timestamp.now(),
    displayName: `${profileData.firstName} ${profileData.lastName}`,
  }

  await setDoc(doc(db, "users", user.uid), userProfile)
  return userProfile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

// -------------------------
// AUTHENTICATION
// -------------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: Omit<UserProfile, "uid" | "email" | "balance" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName">
) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const user = cred.user

    await updateProfile(user, { displayName: `${profileData.firstName} ${profileData.lastName}` })
    const userProfile = await createUserProfile(user, { ...profileData, email })

    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign up error:", error)
    return { success: false, error: error.message }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const user = cred.user
    const profile = await getUserProfile(user.uid)
    if (!profile) return { success: false, error: "User profile not found" }

    return { success: true, user, userProfile: profile }
  } catch (error: any) {
    let errorMessage = "Invalid email or password"
    if (error.code === "auth/user-not-found") errorMessage = "No account found with this email"
    else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password"
    else if (error.code === "auth/too-many-requests") errorMessage = "Too many failed attempts. Try later"

    return { success: false, error: errorMessage }
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Sign out error:", error)
    return { success: false, error: error.message }
  }
}

// -------------------------
// BALANCE & TRANSACTIONS
// -------------------------

export async function updateUserBalance(uid: string, newBalance: number) {
  try {
    await setDoc(doc(db, "users", uid), { balance: newBalance }, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update balance error:", error)
    return { success: false, error: error.message }
  }
}

export async function addTransaction(uid: string, transaction: Omit<Transaction, "id">) {
  try {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const txnData: Transaction = { id: transactionId, ...transaction }
    await setDoc(doc(db, "users", uid, "transactions", transactionId), txnData)
    return { success: true, transaction: txnData }
  } catch (error: any) {
    console.error("[v0] Add transaction error:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const txnRef = collection(db, "users", uid, "transactions")
    const q = query(txnRef, orderBy("timestamp", "desc"))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as Transaction)
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return []
  }
}

// Real-time listener for user transactions
export function listenToUserTransactions(uid: string, callback: (transactions: Transaction[]) => void): Unsubscribe {
  const txnRef = collection(db, "users", uid, "transactions")
  const q = query(txnRef, orderBy("timestamp", "desc"))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data() as Transaction)))
}

// -------------------------
// PROFILE UPDATES
// -------------------------

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  try {
    await setDoc(doc(db, "users", uid), updates, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update profile error:", error)
    return { success: false, error: error.message }
  }
}

// Add KYC documents
export async function addKYCDocument(uid: string, documentUrl: string) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return { success: false, error: "User not found" }

    const updatedDocs = [...(profile.kycDocuments || []), documentUrl]
    await setDoc(doc(db, "users", uid), { kycDocuments: updatedDocs }, { merge: true })

    // Also create a record in the kycDocuments collection for admin review
    const kycId = `KYC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    await setDoc(doc(db, "kycDocuments", kycId), {
      id: kycId,
      userId: uid,
      username: profile.displayName || profile.username || profile.email,
      documentUrl,
      uploadedAt: Timestamp.now().toMillis(),
      status: "pending",
    })

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Add KYC document error:", error)
    return { success: false, error: error.message }
  }
}

// Update both main and profit balances
export async function updateUserBalances(uid: string, mainBalance?: number, profitBalance?: number) {
  try {
    const updateData: any = {}
    if (mainBalance !== undefined) updateData.balance = mainBalance
    if (profitBalance !== undefined) updateData.profitBalance = profitBalance
    await setDoc(doc(db, "users", uid), updateData, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update balances error:", error)
    return { success: false, error: error.message }
  }
}
// -------------------------
// ACTIVITY LOGGING
// -------------------------

export interface Activity {
  id?: string
  userId: string
  username: string
  type: "login" | "deposit_approved" | "withdrawal_approved" | "kyc_approved" | "balance_change" | "profile_update"
  description: string
  amount?: number
  previousValue?: number | string
  newValue?: number | string
  timestamp: Timestamp
}

// Log user activity
export async function logUserActivity(uid: string, activity: Omit<Activity, "id" | "userId" | "timestamp">) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return { success: false, error: "User not found" }

    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    await setDoc(doc(db, "activities", activityId), {
      id: activityId,
      userId: uid,
      username: profile.displayName || profile.username || profile.email,
      ...activity,
      timestamp: Timestamp.now(),
    })

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Log activity error:", error)
    return { success: false, error: error.message }
  }
}

// Listen to user activities in real-time
export function listenToUserActivities(uid: string, callback: (activities: Activity[]) => void): Unsubscribe {
  const q = query(collection(db, "activities"), where("userId", "==", uid), orderBy("timestamp", "desc"))
  return onSnapshot(q, (snap) => {
    const activities = snap.docs.map((d) => d.data() as Activity)
    callback(activities)
  })
}
