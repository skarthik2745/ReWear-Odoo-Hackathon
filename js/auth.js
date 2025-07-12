// ReWear Authentication JavaScript
// Handles login, signup, and social authentication

let currentUser = null;

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Authentication page loaded successfully.");

  // Check if user is already authenticated
  checkAuthStatus();

  // Initialize authentication functionality
  initializeAuth();

  // Set up event listeners
  setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
      // Redirect to dashboard if already logged in
      if (
        window.location.pathname.includes("login.html") ||
        window.location.pathname.includes("signup.html")
      ) {
        window.location.href = "dashboard.html";
      }
    }
  });
}

// Initialize authentication functionality
function initializeAuth() {
  // Initialize any additional auth features
  console.log("Authentication functionality initialized");
}

// Set up event listeners
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Password toggle
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword) {
    togglePassword.addEventListener("click", togglePasswordVisibility);
  }

  // Password strength indicator
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", checkPasswordStrength);
  }
}

// Handle login form submission
async function handleLogin(event) {
  console.log("handleLogin called");
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe")?.checked;

  // Validate form
  if (!email || !password) {
    showError("Please fill in all fields");
    return;
  }

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    showLoading(submitBtn);

    // Sign in with Firebase
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);

    // Set persistence based on remember me
    if (rememberMe) {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } else {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
    }

    // Hide loading state
    hideLoading(submitBtn, originalText);

    // Show success message
    showSuccessMessage("Login successful! Redirecting...");

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    hideLoading(submitBtn, originalText);
    showError(getErrorMessage(error.code));
  }
}

// Handle signup form submission
async function handleSignup(event) {
  console.log("handleSignup called");
  event.preventDefault();

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const userType = document.querySelector(
    'input[name="userType"]:checked'
  ).value;
  const termsCheck = document.getElementById("termsCheck").checked;
  const newsletterCheck = document.getElementById("newsletterCheck").checked;

  // Validate form
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showError("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters long");
    return;
  }

  if (!termsCheck) {
    showError("Please agree to the Terms of Service and Privacy Policy");
    return;
  }

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    showLoading(submitBtn);

    // Create user with Firebase
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    // Update user profile
    await userCredential.user.updateProfile({
      displayName: `${firstName} ${lastName}`,
      photoURL: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=28a745&color=fff`,
    });

    // Create user document in Firestore
    await createUserDocument(userCredential.user, {
      firstName,
      lastName,
      userType,
      newsletterSubscribed: newsletterCheck,
    });

    // Hide loading state
    hideLoading(submitBtn, originalText);

    // Show success message
    showSuccessMessage("Account created successfully! Welcome to ReWear!");

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  } catch (error) {
    console.error("Signup error:", error);
    hideLoading(submitBtn, originalText);
    showError(getErrorMessage(error.code));
  }
}

// Create user document in Firestore
async function createUserDocument(user, additionalData) {
  try {
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      userType: additionalData.userType,
      points: 0,
      itemsDonated: 0,
      itemsReceived: 0,
      badges: [],
      newsletterSubscribed: additionalData.newsletterSubscribed,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await firebase.firestore().collection("users").doc(user.uid).set(userDoc);

    console.log("User document created successfully");
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const result = await firebase.auth().signInWithPopup(provider);

    // Check if user document exists, if not create one
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(result.user.uid)
      .get();

    if (!userDoc.exists) {
      const displayName = result.user.displayName || "Anonymous User";
      const firstName = displayName.split(" ")[0] || "Anonymous";
      const lastName = displayName.split(" ").slice(1).join(" ") || "User";

      await createUserDocument(result.user, {
        firstName,
        lastName,
        userType: "donor",
        newsletterSubscribed: false,
      });
    }

    showSuccessMessage("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Google sign-in error:", error);
    showError(getErrorMessage(error.code));
  }
}

// Sign up with Google
async function signUpWithGoogle() {
  // Same as sign in with Google for new users
  await signInWithGoogle();
}

// Sign in with Facebook
async function signInWithFacebook() {
  try {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");

    const result = await firebase.auth().signInWithPopup(provider);

    // Check if user document exists, if not create one
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(result.user.uid)
      .get();

    if (!userDoc.exists) {
      const displayName = result.user.displayName || "Anonymous User";
      const firstName = displayName.split(" ")[0] || "Anonymous";
      const lastName = displayName.split(" ").slice(1).join(" ") || "User";

      await createUserDocument(result.user, {
        firstName,
        lastName,
        userType: "donor",
        newsletterSubscribed: false,
      });
    }

    showSuccessMessage("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Facebook sign-in error:", error);
    showError(getErrorMessage(error.code));
  }
}

// Sign up with Facebook
async function signUpWithFacebook() {
  // Same as sign in with Facebook for new users
  await signInWithFacebook();
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordInput =
    document.getElementById("password") ||
    document.getElementById("confirmPassword");
  const toggleBtn = document.getElementById("togglePassword");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    passwordInput.type = "password";
    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

// Check password strength
function checkPasswordStrength(event) {
  const password = event.target.value;
  const strengthIndicator = document.getElementById("passwordStrength");

  if (!strengthIndicator) return;

  let strength = 0;
  let feedback = "";

  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  switch (strength) {
    case 0:
    case 1:
      feedback = "Very Weak";
      strengthIndicator.className = "text-danger";
      break;
    case 2:
      feedback = "Weak";
      strengthIndicator.className = "text-warning";
      break;
    case 3:
      feedback = "Fair";
      strengthIndicator.className = "text-info";
      break;
    case 4:
      feedback = "Good";
      strengthIndicator.className = "text-primary";
      break;
    case 5:
      feedback = "Strong";
      strengthIndicator.className = "text-success";
      break;
  }

  strengthIndicator.textContent = feedback;
}

// Get error message from Firebase error code
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password is too weak";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later";
    case "auth/popup-closed-by-user":
      return "Login cancelled";
    case "auth/popup-blocked":
      return "Popup blocked by browser. Please allow popups and try again";
    default:
      return "An error occurred. Please try again";
  }
}

// Show loading on button
function showLoading(element) {
  if (window.ReWearUtils && window.ReWearUtils.showLoading) {
    window.ReWearUtils.showLoading(element);
  } else {
    element.innerHTML = '<div class="loading"></div>';
    element.disabled = true;
  }
}

// Hide loading on button
function hideLoading(element, originalText) {
  if (window.ReWearUtils && window.ReWearUtils.hideLoading) {
    window.ReWearUtils.hideLoading(element, originalText);
  } else {
    element.innerHTML = originalText;
    element.disabled = false;
  }
}

// Show success message
function showSuccessMessage(message) {
  if (window.ReWearUtils && window.ReWearUtils.showSuccessMessage) {
    window.ReWearUtils.showSuccessMessage(message);
  } else {
    alert(message);
  }
}

// Show error message
function showError(message) {
  const errorModal = document.getElementById("errorModal");
  const errorMessage = document.getElementById("errorMessage");

  if (errorModal && errorMessage) {
    errorMessage.textContent = message;
    const bootstrapModal = new bootstrap.Modal(errorModal);
    bootstrapModal.show();
  } else {
    alert(message);
  }
}

// Export functions for use in other modules
window.AuthUtils = {
  handleLogin,
  handleSignup,
  signInWithGoogle,
  signUpWithGoogle,
  signInWithFacebook,
  signUpWithFacebook,
};
