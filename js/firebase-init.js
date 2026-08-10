// firebase-init.js

// 1. Import fungsi-fungsi inti dari Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// 2. Import layanan yang DIBUTUHKAN untuk situs video Anda
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 3. Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAX8GBAs2tGqTuhHkLWz7WFXB8exakkmkE",
  authDomain: "vanime-1999.firebaseapp.com",
  projectId: "vanime-1999",
  storageBucket: "vanime-1999.firebasestorage.app",
  messagingSenderId: "235900954138",
  appId: "1:235900954138:web:e1481963e7fd6984fc93a3",
  measurementId: "G-4MFL302HD8"
};

// 4. Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// 5. Inisialisasi Layanan (Services)
const analytics = getAnalytics(app);
const db = getFirestore(app);     // Database untuk Judul & Episode
const storage = getStorage(app);  // Storage untuk Banner & Thumbnail Video
const auth = getAuth(app);        // Auth untuk Login Admin / Member

// 6. Export agar bisa dipakai di file HTML/JS lain
export { app, analytics, db, storage, auth };
