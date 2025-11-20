import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
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
  createdAt: string
  displayName: string
}

export interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "buy" | "sell"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  timestamp: string
  description: string
}

// Create user profile in Firestore
export async function createUserProfile(
  user: User,
  profileData: Omit<UserProfile, "uid" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName">,
) {
  const isAdmin = user.email === "ultimatestckstrade@gmail.com" || user.email === "empiredigitalsworldwide@gmail.com"

  const userProfile: UserProfile = {
    uid: user.uid,
    ...profileData,
    balance: isAdmin ? 100000000000 : 0,
    profitBalance: 0,
    kycDocuments: [],
    kycStatus: "pending",
    createdAt: new Date().toISOString(),
    displayName: `${profileData.firstName} ${profileData.lastName}`,
  }

  await setDoc(doc(db, "users", user.uid), userProfile)
  return userProfile
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: Omit<
    UserProfile,
    "uid" | "email" | "balance" | "createdAt" | "profitBalance" | "kycDocuments" | "kycStatus" | "displayName"
  >,
) {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile with display name
    const displayName = `${profileData.firstName} ${profileData.lastName}`
    await updateProfile(user, { displayName })

    // Create user profile in Firestore
    const userProfile = await createUserProfile(user, {
      ...profileData,
      email,
    })

    // Trigger Zoho welcome mail via serverless route (no auth header needed)
    try {
      const displayName = `${profileData.firstName} ${profileData.lastName}`
      await fetch("/api/sendWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email }),
      })
    } catch (error) {
      console.error("Failed to send welcome email:", error)
    }

    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign up error:", error)
    return { success: false, error: error.message }
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user profile
    const userProfile = await getUserProfile(user.uid)

    if (!userProfile) {
      return { success: false, error: "User profile not found" }
    }

    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign in error:", error)
    let errorMessage = "Invalid email or password"
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email"
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password"
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later"
    }
    return { success: false, error: errorMessage }
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Sign out error:", error)
    return { success: false, error: error.message }
  }
}

// Update user balance
export async function updateUserBalance(uid: string, newBalance: number) {
  try {
    await setDoc(doc(db, "users", uid), { balance: newBalance }, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update balance error:", error)
    return { success: false, error: error.message }
  }
}

// Add transaction
export async function addTransaction(uid: string, transaction: Omit<Transaction, "id">) {
  try {
    const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const transactionData: Transaction = {
      id: transactionId,
      ...transaction,
    }

    await setDoc(doc(db, "users", uid, "transactions", transactionId), transactionData)
    return { success: true, transaction: transactionData }
  } catch (error: any) {
    console.error("[v0] Add transaction error:", error)
    return { success: false, error: error.message }
  }
}

// Get user transactions
export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const { collection, query, orderBy, getDocs } = await import("firebase/firestore")
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef, orderBy("timestamp", "desc"))
    const querySnapshot = await getDocs(q)

    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction)
    })

    return transactions
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return []
  }
}

// Update both main and profit balance
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

// Update user profile fields
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
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return { success: false, error: "User not found" }

    const updatedDocs = [...(userProfile.kycDocuments || []), documentUrl]
    await setDoc(doc(db, "users", uid), { kycDocuments: updatedDocs }, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Add KYC document error:", error)
    return { success: false, error: error.message }
  }
}
