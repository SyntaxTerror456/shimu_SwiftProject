// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC1uhkwKOhEVUO-8a80I5eNDl-yGiTXvfg",
  authDomain: "teste-4aa31.firebaseapp.com",
  projectId: "teste-4aa31",
  storageBucket: "teste-4aa31.firebasestorage.app",
  messagingSenderId: "569744421560",
  appId: "1:569744421560:web:b098bbc89915279645fa4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
