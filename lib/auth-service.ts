// auth-service.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  type User 
} from "firebase/auth"
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  Timestamp 
} from "firebase/firestore"
import { auth, db } from "./firebase"

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

export interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "buy" | "sell"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  timestamp: Timestamp
  description: string
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
    balance: isAdmin ? 100_000_000_000 : 0,
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
  const docSnap = await getDoc(doc(db, "users", uid))
  if (!docSnap.exists()) return null
  return docSnap.data() as UserProfile
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    await updateProfile(user, { displayName: `${profileData.firstName} ${profileData.lastName}` })
    const userProfile = await createUserProfile(user, { ...profileData, email })

    // Optional: Trigger welcome email
    try {
      await fetch("/api/sendWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userProfile.displayName, email }),
      })
    } catch (err) {
      console.error("[v0] Failed to send welcome email:", err)
    }

    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign up error:", error)
    return { success: false, error: error.message }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const userProfile = await getUserProfile(user.uid)
    if (!userProfile) return { success: false, error: "User profile not found" }
    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign in error:", error)
    let errorMessage = "Invalid email or password"
    if (error.code === "auth/user-not-found") errorMessage = "No account found with this email"
    else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password"
    else if (error.code === "auth/too-many-requests") errorMessage = "Too many failed attempts. Please try again later"
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
    const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const transactionData: Transaction = { id: transactionId, ...transaction }
    await setDoc(doc(db, "users", uid, "transactions", transactionId), transactionData)
    return { success: true, transaction: transactionData }
  } catch (error: any) {
    console.error("[v0] Add transaction error:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef, orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as Transaction)
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return []
  }
}

// -------------------------
// UPDATE PROFILE & KYC
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

export async function addKYCDocument(uid: string, documentUrl: string) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return { success: false, error: "User not found" }
    const updatedDocs = [...profile.kycDocuments, documentUrl]
    await setDoc(doc(db, "users", uid), { kycDocuments: updatedDocs }, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Add KYC document error:", error)
    return { success: false, error: error.message }
  }
}
