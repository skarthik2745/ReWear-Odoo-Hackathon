// firebase.js
// Centralized Firebase config and initialization

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtzqpNibiQ-BaHOeZYZWWDDuyyxFoHeb4",
  authDomain: "rewear-bb4ba.firebaseapp.com",
  projectId: "rewear-bb4ba",
  storageBucket: "rewear-bb4ba.appspot.com",
  messagingSenderId: "711190263430",
  appId: "1:711190263430:web:152d54a6df8d03d2ec8307",
  measurementId: "G-N9JC8B304P",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

window.firebaseApp = { firebase, auth, db, storage };
