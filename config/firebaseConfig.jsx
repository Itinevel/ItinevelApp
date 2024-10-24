import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCWNfcyofpMj1k16wk3bkarZ4SiLCMSVGo",
  authDomain: "itinefy-project.firebaseapp.com",
  projectId: "itinefy-project",
  storageBucket: "itinefy-project.appspot.com",
  messagingSenderId: "1026769594541",
  appId: "1:1026769594541:web:8471081e848892d83dfe24",
  measurementId: "G-69VK750WYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  // Ensure that analytics only runs in the browser
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.log("Firebase Analytics is not supported in this environment.");
    }
  });
}

const storage = getStorage(app);  // Initialize Firebase Storage

export { storage };  // Export storage instance to use in your components
