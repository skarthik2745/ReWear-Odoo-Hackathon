// ReWear Add Item JavaScript
// Handles item creation, photo upload, and form submission

let currentUser = null;
let uploadedImages = [];

// Initialize add item page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Add item page loaded successfully.");

  // Check authentication status
  checkAuthStatus();

  // Initialize add item functionality
  initializeAddItem();

  // Set up event listeners
  setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
    } else {
      // Redirect to login if not authenticated
      window.location.href = "login.html";
    }
  });
}

// Initialize add item functionality
function initializeAddItem() {
  // Initialize any additional add item features
  console.log("Add item functionality initialized");
}

// Set up event listeners
function setupEventListeners() {
  // Photo upload
  const photoInput = document.getElementById("photoInput");
  const uploadArea = document.getElementById("uploadArea");

  if (photoInput) {
    photoInput.addEventListener("change", handlePhotoUpload);
  }

  if (uploadArea) {
    uploadArea.addEventListener("dragover", handleDragOver);
    uploadArea.addEventListener("drop", handleDrop);
    uploadArea.addEventListener("click", () => photoInput.click());
  }

  // Form submission
  const addItemForm = document.getElementById("addItemForm");
  if (addItemForm) {
    addItemForm.addEventListener("submit", handleFormSubmission);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// Handle photo upload
function handlePhotoUpload(event) {
  const files = event.target.files;
  if (files.length === 0) return;

  // Validate files
  const validFiles = Array.from(files).filter((file) => {
    if (!file.type.startsWith("image/")) {
      showErrorMessage(`${file.name} is not an image file`);
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showErrorMessage(`${file.name} is too large. Maximum size is 5MB`);
      return false;
    }

    return true;
  });

  if (validFiles.length === 0) return;

  // Add to uploaded images array
  uploadedImages = uploadedImages.concat(validFiles);

  // Update preview
  updatePhotoPreview();
}

// Handle drag over
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

// Handle drop
function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length === 0) return;

  // Create a fake event for handlePhotoUpload
  const fakeEvent = { target: { files: files } };
  handlePhotoUpload(fakeEvent);
}

// Update photo preview
function updatePhotoPreview() {
  const previewContainer = document.getElementById("photoPreview");
  if (!previewContainer) return;

  previewContainer.innerHTML = "";

  uploadedImages.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const col = document.createElement("div");
      col.className = "col-md-3 col-sm-4 col-6 mb-3";

      col.innerHTML = `
                <div class="photo-preview-item position-relative">
                    <img src="${e.target.result}" alt="Preview" class="img-fluid rounded">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                            onclick="removePhoto(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

      previewContainer.appendChild(col);
    };
    reader.readAsDataURL(file);
  });

  // Update upload area text
  const uploadArea = document.getElementById("uploadArea");
  if (uploadArea) {
    const textElement = uploadArea.querySelector("p");
    if (textElement) {
      textElement.textContent = `${uploadedImages.length} photo${
        uploadedImages.length !== 1 ? "s" : ""
      } selected`;
    }
  }
}

// Remove photo
function removePhoto(index) {
  uploadedImages.splice(index, 1);
  updatePhotoPreview();
}

// Handle form submission
async function handleFormSubmission(event) {
  event.preventDefault();

  if (!currentUser) {
    showErrorMessage("Please log in to add items");
    return;
  }

  if (uploadedImages.length === 0) {
    showErrorMessage("Please upload at least one photo");
    return;
  }

  const form = event.target;
  const formData = new FormData(form);

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  try {
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    showLoading(submitBtn);

    // Upload images to Firebase Storage
    const imageUrls = await uploadImages();

    // Create item document
    const itemData = {
      title:
        formData.get("title") ||
        form.querySelector('input[placeholder*="title"]').value,
      category: formData.get("category") || form.querySelector("select").value,
      size: formData.get("size") || form.querySelectorAll("select")[1].value,
      condition:
        formData.get("condition") || form.querySelectorAll("select")[2].value,
      itemType:
        formData.get("itemType") || form.querySelectorAll("select")[3].value,
      description:
        formData.get("description") || form.querySelector("textarea").value,
      brand:
        formData.get("brand") ||
        form.querySelector('input[placeholder*="Brand"]').value,
      color:
        formData.get("color") ||
        form.querySelector('input[placeholder*="Color"]').value,
      pickupLocation:
        formData.get("pickupLocation") ||
        form.querySelectorAll("select")[4].value,
      contactEmail:
        formData.get("contactEmail") ||
        form.querySelector('input[type="email"]').value,
      contactPhone:
        formData.get("contactPhone") ||
        form.querySelector('input[type="tel"]').value,
      images: imageUrls,
      donorId: currentUser.uid,
      donorName: currentUser.displayName || "Anonymous",
      donorImage:
        currentUser.photoURL ||
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      status: "available",
      requests: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    await saveItemToFirestore(itemData);

    // Hide loading state
    hideLoading(submitBtn, originalText);

    // Show success modal
    showSuccessModal();

    // Reset form
    form.reset();
    uploadedImages = [];
    updatePhotoPreview();
  } catch (error) {
    console.error("Error submitting item:", error);
    hideLoading(submitBtn, originalText);
    showErrorMessage("Failed to submit item. Please try again.");
  }
}

// Upload images to Firebase Storage
async function uploadImages() {
  const imageUrls = [];

  for (let i = 0; i < uploadedImages.length; i++) {
    const file = uploadedImages[i];
    const fileName = `${currentUser.uid}_${Date.now()}_${i}_${file.name}`;
    const storageRef = firebase.storage().ref(`items/${fileName}`);

    try {
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      imageUrls.push(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload images");
    }
  }

  return imageUrls;
}

// Save item to Firestore
async function saveItemToFirestore(itemData) {
  try {
    const docRef = await firebase.firestore().collection("items").add(itemData);

    console.log("Item saved with ID:", docRef.id);

    // Update user's items count
    await updateUserItemsCount();

    return docRef.id;
  } catch (error) {
    console.error("Error saving item to Firestore:", error);
    throw new Error("Failed to save item");
  }
}

// Update user's items count
async function updateUserItemsCount() {
  try {
    const userRef = firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid);
    await userRef.update({
      itemsDonated: firebase.firestore.FieldValue.increment(1),
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user items count:", error);
  }
}

// Show success modal
function showSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
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
function showErrorMessage(message) {
  if (window.ReWearUtils && window.ReWearUtils.showErrorMessage) {
    window.ReWearUtils.showErrorMessage(message);
  } else {
    alert(message);
  }
}

// Add CSS for drag and drop
const style = document.createElement("style");
style.textContent = `
    .upload-area {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .upload-area:hover {
        background-color: #f8f9fa;
        border-color: #28a745 !important;
    }
    
    .upload-area.drag-over {
        background-color: #e8f5e8;
        border-color: #28a745 !important;
        transform: scale(1.02);
    }
    
    .photo-preview-item {
        transition: all 0.3s ease;
    }
    
    .photo-preview-item:hover {
        transform: scale(1.05);
    }
    
    .photo-preview-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
    }
`;
document.head.appendChild(style);

// Export functions for use in other modules
window.AddItemUtils = {
  handlePhotoUpload,
  removePhoto,
  handleFormSubmission,
};
