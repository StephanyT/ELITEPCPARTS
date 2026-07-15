import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ------------------------------------------------------------------
// ONE persistent Firebase backend shared by ALL deployments.
// Every deployed copy of this site (any CloudFront domain, any clone)
// points at this single project, so Firestore data, user accounts,
// carts, and orders are shared and persist across deployments.
// This config is a PUBLIC client identifier — safe to commit. Do not
// fork it per deployment; keep one project so state stays unified.
// (Only Google sign-in needs each deployment domain added under
//  Firebase → Authentication → Authorized domains; email/password and
//  all Firestore reads/writes are domain-agnostic.)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyASCnX7W8_PRnvXiZJ16UTjqJ-LQcsvARM",
  authDomain: "elitepcparts-5d89d.firebaseapp.com",
  projectId: "elitepcparts-5d89d",
  storageBucket: "elitepcparts-5d89d.firebasestorage.app",
  messagingSenderId: "573933405257",
  appId: "1:573933405257:web:54cf2ce594062cfe87ab98",
};

firebase.initializeApp(firebaseConfig);

// Expose globally so the classic (non-module) page scripts can use them.
window.firebase = firebase;
window.auth = firebase.auth();
window.db = firebase.firestore();
