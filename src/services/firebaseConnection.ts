
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAs1o1T7-0LXPH_YoW3FJH-kmEJKQishI4",
  authDomain: "bazarreforamar.firebaseapp.com",
  projectId: "bazarreforamar",
  storageBucket: "bazarreforamar.appspot.com",
  messagingSenderId: "946380077705",
  appId: "1:946380077705:web:06780d3489553b7d502458"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app);
const storage = getStorage(app)
const provider = new GoogleAuthProvider();

export { db, storage, auth, provider };