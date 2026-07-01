const firebaseConfig = {
  apiKey: "AIzaSyASCnX7W8_PRnvXiZJ16UTjqJ-LQcsvARM",
  authDomain: "elitepcparts-5d89d.firebaseapp.com",
  projectId: "elitepcparts-5d89d",
  storageBucket: "elitepcparts-5d89d.firebasestorage.app",
  messagingSenderId: "573933405257",
  appId: "1:573933405257:web:54cf2ce594062cfe87ab98",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();