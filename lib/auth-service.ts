"use client"

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
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { auth, db } from "./firebase"

export { auth }

// ------------------ Interfaces ------------------

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

export interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "buy" | "sell"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  timestamp: Timestamp
  description: string
}

// ------------------ User Profile ------------------

export async function createUserProfile(
  user: User,
  profileData: Omit<UserProfile, "uid" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName">
) {
  const isAdmin = ["ultimatestckstrade@gmail.com", "empiredigitalsworldwide@gmail.com"].includes(user.email || "")

  const userProfile: UserProfile = {
    uid: user.uid,
    ...profileData,
    balance: isAdmin ? 100_000_000_000 : 0,
    profitBalance: 0,
    kycDocuments: [],
    kycStatus: "pending",
    createdAt: serverTimestamp() as Timestamp,
    displayName: `${profileData.firstName} ${profileData.lastName}`,
  }

  await setDoc(doc(db, "users", user.uid), userProfile)
  return userProfile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return docSnap.data() as UserProfile
}

// ------------------ Auth Functions ------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: Omit<UserProfile, "uid" | "email" | "balance" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName">
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update display name
    const displayName = `${profileData.firstName} ${profileData.lastName}`
    await updateProfile(user, { displayName })

    // Create Firestore profile
    const userProfile = await createUserProfile(user, { ...profileData, email })

    // Optional: Trigger welcome email via serverless
    try {
      await fetch("/api/sendWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email }),
      })
    } catch (err) {
      console.error("Failed to send welcome email:", err)
    }

    return { success: true, user, userProfile }
  } catch (err: any) {
    console.error("[v0] Sign up error:", err)
    return { success: false, error: err.message || "Sign up failed" }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const userProfile = await getUserProfile(user.uid)
    if (!userProfile) return { success: false, error: "User profile not found" }
    return { success: true, user, userProfile }
  } catch (err: any) {
    console.error("[v0] Sign in error:", err)
    let message = "Invalid email or password"
    if (err.code === "auth/user-not-found") message = "No account found with this email"
    else if (err.code === "auth/wrong-password") message = "Incorrect password"
    else if (err.code === "auth/too-many-requests") message = "Too many failed attempts. Try later"
    return { success: false, error: message }
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Sign out error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Transactions ------------------

export async function addTransaction(uid: string, transaction: Omit<Transaction, "id" | "timestamp">) {
  try {
    const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const transactionData: Transaction = {
      id: transactionId,
      ...transaction,
      timestamp: serverTimestamp() as Timestamp,
    }

    await setDoc(doc(db, "users", uid, "transactions", transactionId), transactionData)
    return { success: true, transaction: transactionData }
  } catch (err: any) {
    console.error("[v0] Add transaction error:", err)
    return { success: false, error: err.message }
  }
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef, orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)

    const transactions: Transaction[] = []
    snapshot.forEach((doc) => {
      const data = doc.data() as Transaction
      transactions.push({
        ...data,
        timestamp: data.timestamp && "toDate" in data.timestamp ? data.timestamp.toDate() as any : new Date(data.timestamp),
      })
    })

    return transactions
  } catch (err) {
    console.error("[v0] Get transactions error:", err)
    return []
  }
}

// ------------------ Balances ------------------

export async function updateUserBalance(uid: string, newBalance: number) {
  try {
    await setDoc(doc(db, "users", uid), { balance: newBalance }, { merge: true })
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Update balance error:", err)
    return { success: false, error: err.message }
  }
}

export async function updateUserBalances(uid: string, mainBalance?: number, profitBalance?: number) {
  try {
    const updates: any = {}
    if (mainBalance !== undefined) updates.balance = mainBalance
    if (profitBalance !== undefined) updates.profitBalance = profitBalance
    await setDoc(doc(db, "users", uid), updates, { merge: true })
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Update balances error:", err)
    return { success: false, error: err.message }
  }
}

// ------------------ Profile Updates ------------------

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  try {
    await setDoc(doc(db, "users", uid), updates, { merge: true })
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Update profile error:", err)
    return { success: false, error: err.message }
  }
}

export async function addKYCDocument(uid: string, documentUrl: string) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return { success: false, error: "User not found" }
    const updatedDocs = [...(profile.kycDocuments || []), documentUrl]
    await setDoc(doc(db, "users", uid), { kycDocuments: updatedDocs }, { merge: true })
    return { success: true }
  } catch (err: any) {
    console.error("[v0] Add KYC document error:", err)
    return { success: false, error: err.message }
  }
}
