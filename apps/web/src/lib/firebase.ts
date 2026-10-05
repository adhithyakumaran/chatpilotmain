import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAvU5xf2hugiJLr9mYYiAkpyIAWpr57m3g",
    authDomain: "chatpilot-7084d.firebaseapp.com",
    projectId: "chatpilot-7084d",
    storageBucket: "chatpilot-7084d.appspot.com",
    messagingSenderId: "272989079116",
    appId: "1:272989079116:web:52407dbbd09ec8ba91d6e9",
    measurementId: "G-T09QZV8YVE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
