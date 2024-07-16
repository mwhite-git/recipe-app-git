// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "XXXXXXXXXXXXXX",
    authDomain: "XXXXXXXXXXXXXX",
    projectId: "XXXXXXXXXXXXXX",
    storageBucket: "XXXXXXXXXXXXXX",
    messagingSenderId: "XXXXXXXXXXXXXX",
    appId: "XXXXXXXXXXXXXX",
    measurementId: "XXXXXXXXXXXXXX"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
