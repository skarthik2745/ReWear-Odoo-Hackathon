// ReWear Authentication JavaScript
// Handles login, registration, and role-based navigation with Firebase

document.addEventListener("DOMContentLoaded", function () {
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
  // Register form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

// Helper: Show/hide alerts
function showAlert(id, message, type = "success") {
  const alert = document.getElementById(id);
  if (!alert) return;
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.classList.remove("d-none");
}
function hideAlert(id) {
  const alert = document.getElementById(id);
  if (!alert) return;
  alert.classList.add("d-none");
}

// Helper: Show/hide spinner
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  const btnText = document.getElementById(btnId + "Text");
  const btnSpinner = document.getElementById(btnId + "Spinner");
  if (loading) {
    btn.disabled = true;
    btnText.classList.add("d-none");
    btnSpinner.classList.remove("d-none");
  } else {
    btn.disabled = false;
    btnText.classList.remove("d-none");
    btnSpinner.classList.add("d-none");
  }
}

// Registration handler
async function handleRegister(e) {
  e.preventDefault();
  hideAlert("registerAlert");
  setLoading("registerBtn", true);
  const name = document.getElementById("registerName").value.trim();
  const phone = document.getElementById("registerPhone").value.trim();
  const location = document.getElementById("registerLocation").value.trim();
  const role = document.getElementById("registerRole").value;
  const password = document.getElementById("registerPassword").value;
  if (!name || !phone || !location || !role || !password) {
    showAlert("registerAlert", "Please fill in all fields.", "danger");
    setLoading("registerBtn", false);
    return;
  }
  // Use phone as username, fake email for Firebase Auth
  const email = `${phone}@rewear.com`;
  try {
    // Create user in Firebase Auth
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    // Save user info in Firestore
    await firebase.firestore().collection("users").doc(user.uid).set({
      uid: user.uid,
      name: name,
      phone: phone,
      location: location,
      role: role,
      registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showAlert(
      "registerAlert",
      "Registration successful! Redirecting to login...",
      "success"
    );
    setLoading("registerBtn", false);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    console.error("Registration error:", error);
    let msg = error.message;
    if (error.code) msg = `${error.code}: ${msg}`;
    showAlert("registerAlert", msg, "danger");
    setLoading("registerBtn", false);
  }
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();
  hideAlert("loginAlert");
  setLoading("loginBtn", true);
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!phone || !password) {
    showAlert("loginAlert", "Please fill in all fields.", "danger");
    setLoading("loginBtn", false);
    return;
  }
  const email = `${phone}@rewear.com`;
  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    // Get user role from Firestore
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();
    if (!userDoc.exists) {
      showAlert("loginAlert", "User profile not found.", "danger");
      setLoading("loginBtn", false);
      return;
    }
    const role = userDoc.data().role;
    showAlert("loginAlert", "Login successful! Redirecting...", "success");
    setLoading("loginBtn", false);
    setTimeout(() => {
      if (role === "Donor") {
        window.location.href = "donor-dashboard.html";
      } else {
        window.location.href = "receiver-dashboard.html";
      }
    }, 1200);
  } catch (error) {
    showAlert("loginAlert", error.message, "danger");
    setLoading("loginBtn", false);
  }
}
