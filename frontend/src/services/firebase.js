import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAYdXm055qyXDfNywn_o29DUGw57CjOcm4",
    authDomain: "contractchain-0212.firebaseapp.com",
    projectId: "contractchain-0212",
    storageBucket: "contractchain-0212.firebasestorage.app",
    messagingSenderId: "62715120588",
    appId: "1:62715120588:web:f96e468c1a2d8129eeeb69",
    measurementId: "G-ZEMSVBTY9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
