// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAW5H7A7cN3sohPipz4rPmd2rJZe9NCvzU",
  authDomain: "eliteblockmarket.firebaseapp.com",
  databaseURL: "https://eliteblockmarket-default-rtdb.firebaseio.com",
  projectId: "eliteblockmarket",
  storageBucket: "eliteblockmarket.firebasestorage.app",
  messagingSenderId: "946756766507",
  appId: "1:946756766507:web:a307e50d1d6503ce58d36e",
  measurementId: "G-3H80LVSN3W",
}

// Ensure single app instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Export core instances
export const auth = getAuth(app)
export const db = getFirestore(app)

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("profile")
googleProvider.addScope("email")
// Set custom parameters for Google Sign-In popup
googleProvider.setCustomParameters({
  prompt: "select_account",
})
