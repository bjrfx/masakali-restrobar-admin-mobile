// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2S67ECURsC_9J3INJS5nadO76P6cg-uQ",
  authDomain: "restobar-menu.firebaseapp.com",
  projectId: "restobar-menu",
  storageBucket: "restobar-menu.firebasestorage.app",
  messagingSenderId: "233302086303",
  appId: "1:233302086303:web:4219f0babea971d226c8aa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 