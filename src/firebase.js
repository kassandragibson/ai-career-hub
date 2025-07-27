// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1RkAcw5wdid6nlWdXWQtgze4F4Cvh-Q8",
  authDomain: "ai-career-hub-55b4a.firebaseapp.com",
  projectId: "ai-career-hub-55b4a",
  storageBucket: "ai-career-hub-55b4a.firebasestorage.app",
  messagingSenderId: "478620741701",
  appId: "1:478620741701:web:3f4edb581975e70fb1b32c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
