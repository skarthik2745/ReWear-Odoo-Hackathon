// ReWear Leaderboard JavaScript
// Handles leaderboard display, filtering, and profile viewing

let currentUser = null;
let allDonors = [];
let filteredDonors = [];

// Initialize leaderboard when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Leaderboard loaded successfully.");

  // Check authentication status
  checkAuthStatus();

  // Initialize leaderboard functionality
  initializeLeaderboard();

  // Set up event listeners
  setupEventListeners();

  // Load initial data
  loadLeaderboardData();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
    } else {
      // Allow viewing leaderboard without authentication
      console.log("User not authenticated - viewing leaderboard in guest mode");
    }
  });
}

// Initialize leaderboard functionality
function initializeLeaderboard() {
  // Initialize any additional leaderboard features
  console.log("Leaderboard functionality initialized");
}

// Set up event listeners
function setupEventListeners() {
  // Filter controls
  const timeFilter = document.getElementById("timeFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");

  if (timeFilter) {
    timeFilter.addEventListener("change", applyFilters);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  // Load more button
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreDonors);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// Load leaderboard data from Firestore
async function loadLeaderboardData() {
  try {
    showLoadingState();

    const usersSnapshot = await firebase
      .firestore()
      .collection("users")
      .where("points", ">", 0)
      .orderBy("points", "desc")
      .limit(20)
      .get();

    allDonors = [];
    usersSnapshot.forEach((doc) => {
      allDonors.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    filteredDonors = [...allDonors];
    renderLeaderboard();
    hideLoadingState();
  } catch (error) {
    console.error("Error loading leaderboard data:", error);
    hideLoadingState();
    showErrorMessage("Failed to load leaderboard data");

    // Load sample data for demonstration
    loadSampleLeaderboardData();
  }
}

// Load sample leaderboard data for demonstration
function loadSampleLeaderboardData() {
  allDonors = [
    {
      id: "user1",
      displayName: "Priya S.",
      email: "priya@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 650,
      itemsDonated: 15,
      badges: ["🌿", "🟢", "⭐"],
      avgRating: 4.9,
    },
    {
      id: "user2",
      displayName: "Rahul K.",
      email: "rahul@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 580,
      itemsDonated: 12,
      badges: ["🟢", "⭐"],
      avgRating: 4.8,
    },
    {
      id: "user3",
      displayName: "Divya M.",
      email: "divya@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 500,
      itemsDonated: 18,
      badges: ["🌿", "🏆"],
      avgRating: 4.7,
    },
    {
      id: "user4",
      displayName: "Alex P.",
      email: "alex@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 450,
      itemsDonated: 8,
      badges: ["🟢", "🌿"],
      avgRating: 4.8,
    },
    {
      id: "user5",
      displayName: "Sarah M.",
      email: "sarah@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 420,
      itemsDonated: 10,
      badges: ["🟢", "🌿", "🤝"],
      avgRating: 4.9,
    },
    {
      id: "user6",
      displayName: "Maria S.",
      email: "maria@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 380,
      itemsDonated: 6,
      badges: ["🟢", "⭐"],
      avgRating: 4.7,
    },
    {
      id: "user7",
      displayName: "John D.",
      email: "john@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 350,
      itemsDonated: 9,
      badges: ["🟢", "♻"],
      avgRating: 4.6,
    },
    {
      id: "user8",
      displayName: "Lisa K.",
      email: "lisa@example.com",
      photoURL:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      points: 320,
      itemsDonated: 7,
      badges: ["🟢"],
      avgRating: 4.5,
    },
  ];

  filteredDonors = [...allDonors];
  renderLeaderboard();
}

// Render leaderboard
function renderLeaderboard() {
  // Update top 3 podium
  updatePodium();

  // Update full leaderboard list
  updateLeaderboardList();
}

// Update top 3 podium
function updatePodium() {
  const top3 = filteredDonors.slice(0, 3);

  // Update 1st place
  if (top3[0]) {
    updatePodiumItem("first-place", top3[0], 1);
  }

  // Update 2nd place
  if (top3[1]) {
    updatePodiumItem("second-place", top3[1], 2);
  }

  // Update 3rd place
  if (top3[2]) {
    updatePodiumItem("third-place", top3[2], 3);
  }
}

// Update podium item
function updatePodiumItem(className, donor, rank) {
  const podiumItem = document.querySelector(`.${className}`);
  if (!podiumItem) return;

  const badgesHtml = donor.badges
    ? donor.badges
        .map((badge) => `<span class="badge bg-success">${badge}</span>`)
        .join("")
    : "";

  podiumItem.innerHTML = `
        <div class="podium-number">${rank}</div>
        <img src="${donor.photoURL}" alt="${
    donor.displayName
  }" class="rounded-circle mb-2" width="${rank === 1 ? "100" : "80"}" height="${
    rank === 1 ? "100" : "80"
  }">
        <h6 class="fw-bold">${donor.displayName}</h6>
        <p class="text-muted mb-1">${donor.points} points</p>
        <div class="badges mb-2">
            ${badgesHtml}
        </div>
        <small class="text-muted">${donor.itemsDonated} items donated</small>
    `;
}

// Update leaderboard list
function updateLeaderboardList() {
  const leaderboardList = document.querySelector(".leaderboard-list");
  if (!leaderboardList) return;

  // Clear existing items (keep podium)
  const existingItems = leaderboardList.querySelectorAll(".leaderboard-item");
  existingItems.forEach((item) => item.remove());

  // Add items starting from rank 4
  filteredDonors.slice(3).forEach((donor, index) => {
    const rank = index + 4;
    const itemElement = createLeaderboardItem(donor, rank);
    leaderboardList.appendChild(itemElement);
  });
}

// Create leaderboard item element
function createLeaderboardItem(donor, rank) {
  const item = document.createElement("div");
  item.className =
    "leaderboard-item d-flex align-items-center p-4 border-bottom";

  const badgesHtml = donor.badges
    ? donor.badges
        .map((badge) => `<span class="badge bg-success me-1">${badge}</span>`)
        .join("")
    : "";

  item.innerHTML = `
        <div class="rank me-3">
            <span class="badge bg-secondary">${rank}</span>
        </div>
        <div class="avatar me-3">
            <img src="${donor.photoURL}" alt="Avatar" class="rounded-circle" width="50" height="50">
        </div>
        <div class="info flex-grow-1">
            <h6 class="fw-bold mb-1">${donor.displayName}</h6>
            <p class="text-muted mb-1">${donor.itemsDonated} items donated • ${donor.avgRating} avg rating</p>
            <div class="badges">
                ${badgesHtml}
            </div>
        </div>
        <div class="stats text-end me-3">
            <h6 class="fw-bold text-success mb-0">${donor.points}</h6>
            <small class="text-muted">points</small>
        </div>
        <div class="actions">
            <button class="btn btn-outline-success btn-sm" onclick="viewProfile('${donor.id}')">
                <i class="fas fa-user me-1"></i>View Profile
            </button>
        </div>
    `;

  return item;
}

// Apply filters
function applyFilters() {
  const timePeriod = document.getElementById("timeFilter")?.value;
  const category = document.getElementById("categoryFilter")?.value;
  const sortBy = document.getElementById("sortFilter")?.value;

  filteredDonors = [...allDonors];

  // Apply time filter (in a real app, you'd filter by date)
  if (timePeriod && timePeriod !== "all-time") {
    // For demo purposes, we'll just use the existing data
    console.log(`Filtering by time period: ${timePeriod}`);
  }

  // Apply category filter (in a real app, you'd filter by donation categories)
  if (category) {
    // For demo purposes, we'll just use the existing data
    console.log(`Filtering by category: ${category}`);
  }

  // Sort donors
  if (sortBy) {
    sortDonors(sortBy);
  }

  renderLeaderboard();
}

// Sort donors
function sortDonors(sortBy) {
  switch (sortBy) {
    case "points":
      filteredDonors.sort((a, b) => b.points - a.points);
      break;
    case "items":
      filteredDonors.sort((a, b) => b.itemsDonated - a.itemsDonated);
      break;
    case "rating":
      filteredDonors.sort((a, b) => b.avgRating - a.avgRating);
      break;
  }
}

// Load more donors
async function loadMoreDonors() {
  try {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const originalText = loadMoreBtn.innerHTML;

    showLoading(loadMoreBtn);

    // Simulate loading more donors
    setTimeout(() => {
      hideLoading(loadMoreBtn, originalText);
      showSuccessMessage("More donors loaded successfully!");
    }, 1500);
  } catch (error) {
    console.error("Error loading more donors:", error);
    showErrorMessage("Failed to load more donors");
  }
}

// View profile function (called from HTML)
function viewProfile(userId) {
  const donor = allDonors.find((d) => d.id === userId);
  if (!donor) {
    showErrorMessage("Donor not found");
    return;
  }

  // Populate modal with donor details
  const modal = document.getElementById("profileModal");
  const modalProfileImage = document.getElementById("modalProfileImage");
  const modalProfileName = document.getElementById("modalProfileName");
  const modalProfileEmail = document.getElementById("modalProfileEmail");
  const modalProfileBadges = document.getElementById("modalProfileBadges");
  const modalTotalPoints = document.getElementById("modalTotalPoints");
  const modalTotalItems = document.getElementById("modalTotalItems");

  if (modalProfileImage) modalProfileImage.src = donor.photoURL;
  if (modalProfileName) modalProfileName.textContent = donor.displayName;
  if (modalProfileEmail) modalProfileEmail.textContent = donor.email;
  if (modalTotalPoints) modalTotalPoints.textContent = donor.points;
  if (modalTotalItems) modalTotalItems.textContent = donor.itemsDonated;

  if (modalProfileBadges) {
    const badgesHtml = donor.badges
      ? donor.badges
          .map((badge) => `<span class="badge bg-success me-1">${badge}</span>`)
          .join("")
      : "";
    modalProfileBadges.innerHTML = badgesHtml;
  }

  // Load recent donations and feedback
  loadDonorRecentData(donor);

  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

// Load donor's recent data
function loadDonorRecentData(donor) {
  const recentDonations = document.getElementById("modalRecentDonations");
  const recentFeedback = document.getElementById("modalRecentFeedback");

  if (recentDonations) {
    recentDonations.innerHTML = `
            <div class="small text-muted">
                <div class="d-flex justify-content-between mb-1">
                    <span>Blue Denim Jacket</span>
                    <span>2 days ago</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                    <span>Summer Dress</span>
                    <span>1 week ago</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Kids Sweater</span>
                    <span>2 weeks ago</span>
                </div>
            </div>
        `;
  }

  if (recentFeedback) {
    recentFeedback.innerHTML = `
            <div class="small">
                <div class="d-flex justify-content-between mb-1">
                    <span>"Amazing quality! Thank you!"</span>
                    <span class="text-success">50 points</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                    <span>"Perfect fit and great condition"</span>
                    <span class="text-success">45 points</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>"Very generous donor"</span>
                    <span class="text-success">40 points</span>
                </div>
            </div>
        `;
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

// Show loading state
function showLoadingState() {
  const leaderboardCard = document.querySelector(".card-body");
  if (leaderboardCard) {
    leaderboardCard.innerHTML = `
            <div class="text-center py-5">
                <div class="loading"></div>
                <p class="text-muted mt-3">Loading leaderboard...</p>
            </div>
        `;
  }
}

// Hide loading state
function hideLoadingState() {
  // Loading state is hidden when leaderboard is rendered
}

// Show loading on button
function showLoading(element) {
  if (window.ReWearUtils && window.ReWearUtils.showLoading) {
    window.ReWearUtils.showLoading(element);
  }
}

// Hide loading on button
function hideLoading(element, originalText) {
  if (window.ReWearUtils && window.ReWearUtils.hideLoading) {
    window.ReWearUtils.hideLoading(element, originalText);
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
function showErrorMessage(message) {
  if (window.ReWearUtils && window.ReWearUtils.showErrorMessage) {
    window.ReWearUtils.showErrorMessage(message);
  } else {
    alert(message);
  }
}

// Export functions for use in other modules
window.LeaderboardUtils = {
  loadLeaderboardData,
  applyFilters,
  viewProfile,
};
