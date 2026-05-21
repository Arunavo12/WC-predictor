// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo4t_yZMg-Y9R63lgRNLRyu6oEbDIbhZM",
  authDomain: "wc-predictor-b63fe.firebaseapp.com",
  projectId: "wc-predictor-b63fe",
  storageBucket: "wc-predictor-b63fe.firebasestorage.app",
  messagingSenderId: "271535923003",
  appId: "1:271535923003:web:89d62c52cb3b80651fe11e",
  measurementId: "G-RHXDLGVTF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);