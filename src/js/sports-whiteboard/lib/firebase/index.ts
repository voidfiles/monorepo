// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import {} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDUrFDNsgmd3pga2KpjDk86UqYT4QnfNTE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "sports-whiteboard-b93df.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sports-whiteboard-b93df",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "sports-whiteboard-b93df.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "abcdefghijk",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:589298303135:web:a1e55281ebffa338eaa2aa",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DLGG3JDK5S",
};

// Initialize Firebase
let app: FirebaseApp;
let initialized = false;
let analytics;
let performance;
if (!initialized) {
  initialized = true;
  console.log(firebaseConfig);
  app = initializeApp(firebaseConfig);
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
  }
}
// const analytics = getAnalytics(app);
const getApp = (): FirebaseApp => {
  return app;
};

export default getApp;
