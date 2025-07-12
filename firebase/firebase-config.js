// Firebase configuration for ReWear
// Using Firebase CDN imports

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Export for use in other scripts
window.firebaseApp = {
  auth: auth,
  db: db,
  storage: storage,
  analytics: analytics,
};
