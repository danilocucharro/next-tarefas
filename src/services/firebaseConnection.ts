import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAyY-e-byyJX0Hhr63cEUy4CvQf0-2Bjhk",
  authDomain: "next-tarefas-b9780.firebaseapp.com",
  projectId: "next-tarefas-b9780",
  storageBucket: "next-tarefas-b9780.appspot.com",
  messagingSenderId: "1023105312285",
  appId: "1:1023105312285:web:251ba0961cb02f0ecc48f4"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db };