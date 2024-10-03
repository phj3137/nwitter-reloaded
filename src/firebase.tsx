import { getAuth } from "firebase/auth";

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjFf-X6RstvpYzs2i-CAJBKUwdE6jMcAQ",
  authDomain: "nwitter-reloaded-3ebbb.firebaseapp.com",
  projectId: "nwitter-reloaded-3ebbb",
  storageBucket: "nwitter-reloaded-3ebbb.appspot.com",
  messagingSenderId: "466604914123",
  appId: "1:466604914123:web:38cfaf33432dd55293b24e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
