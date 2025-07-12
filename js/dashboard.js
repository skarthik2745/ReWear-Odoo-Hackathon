// ReWear Dashboard JavaScript
// Handles user authentication, data loading, and dashboard functionality

// Firebase configuration and initialization
let currentUser = null;
let userData = null;

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard loaded successfully.");

  // Check authentication status
  checkAuthStatus();

  // Initialize dashboard functionality
  initializeDashboard();

  // Set up event listeners
  setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
      loadUserData();
      updateUIForAuthenticatedUser();
    } else {
      // Redirect to login if not authenticated
      window.location.href = "login.html";
    }
  });
}

// Load user data from Firestore
async function loadUserData() {
  try {
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .get();

    if (userDoc.exists) {
      userData = userDoc.data();
      updateDashboardData();
    } else {
      // Create new user document if it doesn't exist
      await createUserDocument();
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    showErrorMessage("Failed to load user data");
  }
}

// Create new user document
async function createUserDocument() {
  try {
    const userDoc = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || "Anonymous User",
      photoURL:
        currentUser.photoURL ||
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      points: 0,
      itemsDonated: 0,
      itemsReceived: 0,
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .set(userDoc);

    userData = userDoc;
    updateDashboardData();
  } catch (error) {
    console.error("Error creating user document:", error);
    showErrorMessage("Failed to create user profile");
  }
}

// Update dashboard with user data
function updateDashboardData() {
  if (!userData) return;

  // Update user info
  document.getElementById("userName").textContent = userData.displayName;
  document.getElementById("userEmail").textContent = userData.email;
  document.getElementById("welcomeName").textContent =
    userData.displayName.split(" ")[0];

  // Update stats
  document.getElementById("totalPoints").textContent = userData.points || 0;
  document.getElementById("totalItems").textContent =
    userData.itemsDonated || 0;
  document.getElementById("totalBadges").textContent = userData.badges
    ? userData.badges.length
    : 0;

  // Update profile image
  const profileImage = document.querySelector(".profile-avatar img");
  if (profileImage && userData.photoURL) {
    profileImage.src = userData.photoURL;
  }

  // Load user items
  loadUserItems();

  // Load recent activity
  loadRecentActivity();

  // Load feedback received
  loadFeedbackReceived();
}

// Load user's donated items
async function loadUserItems() {
  try {
    const itemsSnapshot = await firebase
      .firestore()
      .collection("items")
      .where("donorId", "==", currentUser.uid)
      .orderBy("createdAt", "desc")
      .limit(6)
      .get();

    const itemsContainer = document.getElementById("myItemsContainer");
    itemsContainer.innerHTML = "";

    if (itemsSnapshot.empty) {
      itemsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-tshirt fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No items donated yet</h6>
                    <a href="add-item.html" class="btn btn-success mt-2">
                        <i class="fas fa-plus me-2"></i>Add Your First Item
                    </a>
                </div>
            `;
      return;
    }

    itemsSnapshot.forEach((doc) => {
      const item = doc.data();
      const itemElement = createItemCard(item, doc.id);
      itemsContainer.appendChild(itemElement);
    });
  } catch (error) {
    console.error("Error loading user items:", error);
  }
}

// Create item card element
function createItemCard(item, itemId) {
  const col = document.createElement("div");
  col.className = "col-md-4 mb-3";

  const statusBadge = getStatusBadge(item.status);
  const statusClass = getStatusClass(item.status);

  col.innerHTML = `
        <div class="item-card">
            <img src="${
              item.images[0] ||
              "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            }" 
                 alt="${item.title}" class="img-fluid rounded-top">
            <div class="item-details p-3">
                <h6 class="fw-bold">${item.title}</h6>
                <p class="text-muted small">${item.category} • ${item.size} • ${
    item.condition
  }</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge ${statusClass}">${statusBadge}</span>
                    <small class="text-muted">${
                      item.requests || 0
                    } requests</small>
                </div>
            </div>
        </div>
    `;

  return col;
}

// Get status badge text
function getStatusBadge(status) {
  switch (status) {
    case "available":
      return "Available";
    case "pending":
      return "Pending";
    case "swapped":
      return "Swapped";
    default:
      return "Available";
  }
}

// Get status badge class
function getStatusClass(status) {
  switch (status) {
    case "available":
      return "bg-success";
    case "pending":
      return "bg-warning";
    case "swapped":
      return "bg-secondary";
    default:
      return "bg-success";
  }
}

// Load recent activity
async function loadRecentActivity() {
  try {
    const activitySnapshot = await firebase
      .firestore()
      .collection("activity")
      .where("userId", "==", currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const activityContainer = document.querySelector(".card-body");
    if (!activityContainer) return;

    // For now, show static activity data
    // In a real implementation, you would populate this with actual activity data
  } catch (error) {
    console.error("Error loading recent activity:", error);
  }
}

// Load feedback received
async function loadFeedbackReceived() {
  try {
    const feedbackSnapshot = await firebase
      .firestore()
      .collection("feedback")
      .where("donorId", "==", currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const feedbackContainer = document.querySelector(".card-body");
    if (!feedbackContainer) return;

    // For now, show static feedback data
    // In a real implementation, you would populate this with actual feedback data
  } catch (error) {
    console.error("Error loading feedback:", error);
  }
}

// Initialize dashboard functionality
function initializeDashboard() {
  // Add any additional dashboard initialization here
  console.log("Dashboard functionality initialized");
}

// Set up event listeners
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Quick action buttons
  const addItemBtn = document.querySelector('a[href="add-item.html"]');
  if (addItemBtn) {
    addItemBtn.addEventListener("click", function (e) {
      // Add any pre-navigation logic here
    });
  }
}

// Handle user logout
async function handleLogout() {
  try {
    await firebase.auth().signOut();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error signing out:", error);
    showErrorMessage("Failed to sign out");
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  // Hide login/signup buttons, show user-specific content
  const authButtons = document.querySelectorAll(".auth-buttons");
  authButtons.forEach((btn) => (btn.style.display = "none"));

  // Show user-specific navigation
  const userNav = document.querySelectorAll(".user-nav");
  userNav.forEach((nav) => (nav.style.display = "block"));
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
function showErrorMessage(message) {
  if (window.ReWearUtils && window.ReWearUtils.showErrorMessage) {
    window.ReWearUtils.showErrorMessage(message);
  } else {
    alert(message);
  }
}

// Export functions for use in other modules
window.DashboardUtils = {
  loadUserData,
  updateDashboardData,
  handleLogout,
};
