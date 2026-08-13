// ============================================
// CRIMSON VEIL — FIREBASE
// ============================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ============================================
// CONFIG
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyC8_wsFs6jfyva62xoBDLUeZJh42Orv7-I",
  authDomain: "sistema-puntos-b46dd.firebaseapp.com",
  projectId: "sistema-puntos-b46dd",
  storageBucket: "sistema-puntos-b46dd.appspot.com",
  messagingSenderId: "412750867994",
  appId: "1:412750867994:web:0627943ce5605d99c3eba3",
  measurementId: "G-5KCWW7FDC8"
};


// ============================================
// INIT
// ============================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ============================================
// EXPORTS
// ============================================

export {
  app,
  auth,
  db
};
