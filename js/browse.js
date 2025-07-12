// ReWear Browse Items JavaScript
// Handles item browsing, filtering, and request functionality

let currentUser = null;
let allItems = [];
let filteredItems = [];

// Initialize browse page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Browse page loaded successfully.");

  // Check authentication status
  checkAuthStatus();

  // Initialize browse functionality
  initializeBrowse();

  // Set up event listeners
  setupEventListeners();

  // Load initial items
  loadItems();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
    } else {
      // Allow browsing without authentication, but show login prompt for requests
      console.log("User not authenticated - browsing in guest mode");
    }
  });
}

// Initialize browse functionality
function initializeBrowse() {
  // Initialize any additional browse features
  console.log("Browse functionality initialized");
}

// Set up event listeners
function setupEventListeners() {
  // Filter controls
  const categoryFilter = document.getElementById("categoryFilter");
  const sizeFilter = document.getElementById("sizeFilter");
  const conditionFilter = document.getElementById("conditionFilter");
  const sortFilter = document.getElementById("sortFilter");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }
  if (sizeFilter) {
    sizeFilter.addEventListener("change", applyFilters);
  }
  if (conditionFilter) {
    conditionFilter.addEventListener("change", applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById("clearFilters");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }

  // Apply filters button
  const applyFiltersBtn = document.getElementById("applyFilters");
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  // Load more button
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreItems);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// Load items from Firestore
async function loadItems() {
  try {
    showLoadingState();

    const itemsSnapshot = await firebase
      .firestore()
      .collection("items")
      .where("status", "==", "available")
      .orderBy("createdAt", "desc")
      .limit(12)
      .get();

    allItems = [];
    itemsSnapshot.forEach((doc) => {
      allItems.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    filteredItems = [...allItems];
    renderItems();
    hideLoadingState();
  } catch (error) {
    console.error("Error loading items:", error);
    hideLoadingState();
    showErrorMessage("Failed to load items");

    // Load sample data for demonstration
    loadSampleItems();
  }
}

// Load sample items for demonstration
function loadSampleItems() {
  allItems = [
    {
      id: "item1",
      title: "Blue Denim Jacket",
      category: "Men",
      size: "Medium",
      condition: "Excellent",
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      ],
      donorName: "Sarah M.",
      donorImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      badges: ["🌿", "🟢"],
      status: "available",
    },
    {
      id: "item2",
      title: "Summer Dress",
      category: "Women",
      size: "Small",
      condition: "Good",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      ],
      donorName: "Priya S.",
      donorImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      badges: ["🌿", "🟢", "⭐"],
      status: "available",
    },
    {
      id: "item3",
      title: "Kids Sweater",
      category: "Kids",
      size: "Age 8-10",
      condition: "Like New",
      images: [
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      ],
      donorName: "Rahul K.",
      donorImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      badges: ["🟢", "⭐"],
      status: "available",
    },
    {
      id: "item4",
      title: "Winter Coat",
      category: "Women",
      size: "Large",
      condition: "Good",
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      ],
      donorName: "Divya M.",
      donorImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      badges: ["🌿", "🏆"],
      status: "available",
    },
  ];

  filteredItems = [...allItems];
  renderItems();
}

// Render items to the page
function renderItems() {
  const itemsContainer = document.getElementById("itemsContainer");
  if (!itemsContainer) return;

  itemsContainer.innerHTML = "";

  if (filteredItems.length === 0) {
    itemsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No items found</h5>
                <p class="text-muted">Try adjusting your filters or check back later for new items.</p>
                <button class="btn btn-outline-success" onclick="clearFilters()">
                    <i class="fas fa-times me-2"></i>Clear Filters
                </button>
            </div>
        `;
    return;
  }

  filteredItems.forEach((item) => {
    const itemElement = createItemCard(item);
    itemsContainer.appendChild(itemElement);
  });
}

// Create item card element
function createItemCard(item) {
  const col = document.createElement("div");
  col.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

  const badgesHtml = item.badges
    ? item.badges
        .map((badge) => `<span class="badge bg-success">${badge}</span>`)
        .join("")
    : "";

  col.innerHTML = `
        <div class="item-card">
            <img src="${item.images[0]}" alt="${item.title}" class="img-fluid rounded-top">
            <div class="item-details p-3">
                <h6 class="fw-bold">${item.title}</h6>
                <p class="text-muted small">${item.category} • ${item.size} • ${item.condition}</p>
                <div class="donor-info d-flex align-items-center mb-2">
                    <img src="${item.donorImage}" alt="Donor" class="rounded-circle me-2" width="25" height="25">
                    <small class="text-muted">by ${item.donorName}</small>
                    <div class="ms-auto">
                        ${badgesHtml}
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success">Available</span>
                    <button class="btn btn-success btn-sm" onclick="requestItem('${item.id}')">
                        <i class="fas fa-gift me-1"></i>Request
                    </button>
                </div>
            </div>
        </div>
    `;

  return col;
}

// Apply filters
function applyFilters() {
  const category = document.getElementById("categoryFilter")?.value;
  const size = document.getElementById("sizeFilter")?.value;
  const condition = document.getElementById("conditionFilter")?.value;
  const sortBy = document.getElementById("sortFilter")?.value;

  filteredItems = allItems.filter((item) => {
    let matches = true;

    if (category && item.category !== category) {
      matches = false;
    }

    if (size && item.size !== size) {
      matches = false;
    }

    if (condition && item.condition !== condition) {
      matches = false;
    }

    return matches;
  });

  // Sort items
  if (sortBy) {
    sortItems(sortBy);
  }

  renderItems();
}

// Sort items
function sortItems(sortBy) {
  switch (sortBy) {
    case "newest":
      filteredItems.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      break;
    case "oldest":
      filteredItems.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      break;
    case "donor-rating":
      // Sort by number of badges (proxy for rating)
      filteredItems.sort(
        (a, b) => (b.badges?.length || 0) - (a.badges?.length || 0)
      );
      break;
  }
}

// Clear all filters
function clearFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  const sizeFilter = document.getElementById("sizeFilter");
  const conditionFilter = document.getElementById("conditionFilter");
  const sortFilter = document.getElementById("sortFilter");

  if (categoryFilter) categoryFilter.value = "";
  if (sizeFilter) sizeFilter.value = "";
  if (conditionFilter) conditionFilter.value = "";
  if (sortFilter) sortFilter.value = "newest";

  filteredItems = [...allItems];
  renderItems();
}

// Load more items
async function loadMoreItems() {
  try {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const originalText = loadMoreBtn.innerHTML;

    showLoading(loadMoreBtn);

    // Simulate loading more items
    setTimeout(() => {
      hideLoading(loadMoreBtn, originalText);
      showSuccessMessage("More items loaded successfully!");
    }, 1500);
  } catch (error) {
    console.error("Error loading more items:", error);
    showErrorMessage("Failed to load more items");
  }
}

// Request item function (called from HTML)
function requestItem(itemId) {
  if (!currentUser) {
    // Show login prompt
    showErrorMessage("Please log in to request items");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  const item = allItems.find((i) => i.id === itemId);
  if (!item) {
    showErrorMessage("Item not found");
    return;
  }

  // Populate modal with item details
  const modal = document.getElementById("requestModal");
  const modalItemImage = document.getElementById("modalItemImage");
  const modalItemTitle = document.getElementById("modalItemTitle");
  const modalItemDetails = document.getElementById("modalItemDetails");

  if (modalItemImage) modalItemImage.src = item.images[0];
  if (modalItemTitle) modalItemTitle.textContent = item.title;
  if (modalItemDetails)
    modalItemDetails.textContent = `${item.category} • ${item.size} • ${item.condition}`;

  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

// Submit request
function submitRequest() {
  const form = document.getElementById("requestForm");
  const formData = new FormData(form);

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  try {
    // Submit request logic here
    showSuccessMessage(
      "Request sent successfully! The donor will contact you soon."
    );

    // Close modal
    const modal = document.getElementById("requestModal");
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();

    // Reset form
    form.reset();
  } catch (error) {
    console.error("Error submitting request:", error);
    showErrorMessage("Failed to send request");
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
  const itemsContainer = document.getElementById("itemsContainer");
  if (itemsContainer) {
    itemsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="loading"></div>
                <p class="text-muted mt-3">Loading items...</p>
            </div>
        `;
  }
}

// Hide loading state
function hideLoadingState() {
  // Loading state is hidden when items are rendered
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
window.BrowseUtils = {
  loadItems,
  applyFilters,
  clearFilters,
  requestItem,
  submitRequest,
};
