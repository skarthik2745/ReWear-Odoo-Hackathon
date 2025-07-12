// js/user.js
// Utility for user role, login status, and navbar rendering

async function getCurrentUser() {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      resolve(user);
    });
  });
}

async function getCurrentUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;
  const userDoc = await firebase
    .firestore()
    .collection("users")
    .doc(user.uid)
    .get();
  if (!userDoc.exists) return null;
  return userDoc.data().role;
}

async function renderNavbar() {
  const user = await getCurrentUser();
  let role = null;
  if (user) {
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();
    if (userDoc.exists) role = userDoc.data().role;
  }

  // Check if we're on the landing page (index.html)
  const isLandingPage =
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === "";

  let nav = `<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html"><i class="fas fa-recycle eco-icon"></i>ReWear</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="browse.html">Browse Items</a></li>
          <li class="nav-item"><a class="nav-link" href="donate.html">Donate Clothes</a></li>
          <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>`;

  // Show login/register for non-authenticated users
  if (!user) {
    nav += `
          <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
          <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>`;
  } else {
    // Show role-specific items for authenticated users
    if (role === "Donor") {
      nav += `<li class="nav-item"><a class="nav-link" href="donor-dashboard.html">Dashboard</a></li>`;
    } else if (role === "Receiver") {
      nav += `<li class="nav-item"><a class="nav-link" href="receiver-dashboard.html">Dashboard</a></li>`;
    }
    nav += `
          <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
          <li class="nav-item"><a class="nav-link" href="#" onclick="logout()">Logout</a></li>`;
  }

  nav += `
        </ul>
      </div>
    </div>
  </nav>`;
  document.getElementById("navbarContainer").innerHTML = nav;
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "login.html";
    });
}

window.UserUtils = { getCurrentUser, getCurrentUserRole, renderNavbar, logout };
