import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCXVsPyVHAIzFsHOsOuppVG9IWPtOc0LH8",
  authDomain: "ultimatestcktrader.firebaseapp.com",
  projectId: "ultimatestcktrader",
  storageBucket: "ultimatestcktrader.firebasestorage.app",
  messagingSenderId: "220545208853",
  appId: "1:220545208853:web:5b8d180688b1e048bd341c",
  measurementId: "G-HYCZTE5T1V",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
