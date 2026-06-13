// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCXVsPyVHAIzFsHOsOuppVG9IWPtOc0LH8",
  authDomain: "Elite Block Market.firebaseapp.com",
  projectId: "Elite Block Market",
  storageBucket: "Elite Block Market.firebasestorage.app",
  messagingSenderId: "220545208853",
  appId: "1:220545208853:web:5b8d180688b1e048bd341c",
  measurementId: "G-HYCZTE5T1V",
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
