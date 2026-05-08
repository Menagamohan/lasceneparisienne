// Firebase configuration
// Replace the values below with your own Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqMnqnHBoCohHPK11uLo6jENmlr-VwsdU",
    authDomain: "lascene-admin.firebaseapp.com",
    projectId: "lascene-admin",
    storageBucket: "lascene-admin.firebasestorage.app",
    messagingSenderId: "1081171102952",
    appId: "1:1081171102952:web:a1bb10a7775cde7f4f4d5d",
    measurementId: "G-QBFWW6QR65"
};

// Initialize Firebase using Compat SDK style
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = null;    // Auth not used — custom login
const storage = null; // Storage not used — images as base64 in Firestore