import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// Option 1: Use environment variables (create .env file with VITE_FIREBASE_* variables)
// Option 2: Replace the values below directly
// Get this from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyA8tobiu59f2EaZM-YkjUQJbUjnhPUDKCo",
  authDomain: "restaurant-prep-manager.firebaseapp.com",
  projectId: "restaurant-prep-manager",
  storageBucket: "restaurant-prep-manager.firebasestorage.app",
  messagingSenderId: "308916703358",
  appId: "1:308916703358:web:358130de0df8d2f9ed882f",
  measurementId: "G-091161JXBQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
