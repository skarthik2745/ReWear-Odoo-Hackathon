// donate.js
// Handles donate form submission with image upload

let currentUser = null;

// Initialize donate page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Donate page loaded successfully.");

  // Check authentication status
  checkAuthStatus();

  // Set up event listeners
  setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
      console.log("User authenticated:", user.email);
    } else {
      console.log("User not authenticated - can still donate as guest");
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Image preview
  const imageInput = document.getElementById("itemImage");
  if (imageInput) {
    imageInput.addEventListener("change", handleImagePreview);
  }

  // Form submission
  const donateForm = document.getElementById("donateForm");
  if (donateForm) {
    donateForm.addEventListener("submit", handleFormSubmission);
  }
}

// Handle image preview
function handleImagePreview(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("imgPreview");
  const previewContainer = document.getElementById("imgPreviewContainer");

  if (file) {
    // Validate file
    if (!file.type.startsWith("image/")) {
      showErrorMessage("Please select an image file");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showErrorMessage("Image size must be less than 5MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      preview.src = evt.target.result;
      previewContainer.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    previewContainer.style.display = "none";
  }
}

// Remove image
function removeImage() {
  document.getElementById("itemImage").value = "";
  document.getElementById("imgPreview").src = "";
  document.getElementById("imgPreviewContainer").style.display = "none";
}

// Handle form submission
async function handleFormSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById("submitBtn");
  const submitBtnText = document.getElementById("submitBtnText");
  const submitBtnSpinner = document.getElementById("submitBtnSpinner");

  // Show loading state
  submitBtn.disabled = true;
  submitBtnText.classList.add("d-none");
  submitBtnSpinner.classList.remove("d-none");

  try {
    // Get form data
    const formData = {
      itemName: document.getElementById("itemName").value,
      itemCategory: document.getElementById("itemCategory").value,
      itemSize: document.getElementById("itemSize").value,
      itemCondition: document.getElementById("itemCondition").value,
      donorName: document.getElementById("donorName").value,
      donorEmail: document.getElementById("donorEmail").value,
      donorMobile: document.getElementById("donorMobile").value,
      donorAddress: document.getElementById("donorAddress").value,
      imageFile: document.getElementById("itemImage").files[0],
    };

    // Validate required fields
    if (
      !formData.itemName ||
      !formData.itemCategory ||
      !formData.itemSize ||
      !formData.itemCondition ||
      !formData.donorName ||
      !formData.donorEmail ||
      !formData.donorMobile ||
      !formData.donorAddress
    ) {
      throw new Error("Please fill in all required fields");
    }

    // Upload image if provided
    let imageUrl = null;
    if (formData.imageFile) {
      imageUrl = await uploadImage(formData.imageFile);
    }

    // Create item data
    const itemData = {
      title: formData.itemName,
      category: formData.itemCategory,
      size: formData.itemSize,
      condition: formData.itemCondition,
      description: `${formData.itemName} - ${formData.itemCondition}`,
      images: imageUrl ? [imageUrl] : [],
      donorId: currentUser ? currentUser.uid : null,
      donorName: formData.donorName,
      donorEmail: formData.donorEmail,
      donorMobile: formData.donorMobile,
      donorAddress: formData.donorAddress,
      donorImage: currentUser
        ? currentUser.photoURL ||
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80"
        : "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80",
      status: "available",
      requests: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      badges: ["🟢"], // Default badge for new items
    };

    // Save to Firestore
    await saveItemToFirestore(itemData);

    // Show success message
    showSuccessMessage();

    // Reset form
    form.reset();
    removeImage();

    // Redirect to browse page after 3 seconds
    setTimeout(() => {
      window.location.href = "browse.html";
    }, 3000);
  } catch (error) {
    console.error("Error submitting item:", error);
    showErrorMessage(error.message);
  } finally {
    // Hide loading state
    submitBtn.disabled = false;
    submitBtnText.classList.remove("d-none");
    submitBtnSpinner.classList.add("d-none");
  }
}

// Upload image to Firebase Storage
async function uploadImage(file) {
  try {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`items/${Date.now()}_${file.name}`);

    const snapshot = await imageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    console.log("Image uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

// Save item to Firestore
async function saveItemToFirestore(itemData) {
  try {
    const docRef = await firebase.firestore().collection("items").add(itemData);
    console.log("Item saved successfully with ID:", docRef.id);

    // Update user's items count if authenticated
    if (currentUser) {
      await updateUserItemsCount();
    }

    return docRef.id;
  } catch (error) {
    console.error("Error saving item:", error);
    throw new Error("Failed to save item. Please try again.");
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
      itemsCount: firebase.firestore.FieldValue.increment(1),
      lastDonation: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user items count:", error);
  }
}

// Show success message
function showSuccessMessage() {
  const successAlert = document.getElementById("successAlert");
  if (successAlert) {
    successAlert.style.display = "block";
  }
}

// Show error message
function showErrorMessage(message) {
  // Create or update error alert
  let errorAlert = document.getElementById("errorAlert");
  if (!errorAlert) {
    errorAlert = document.createElement("div");
    errorAlert.id = "errorAlert";
    errorAlert.className = "alert alert-danger alert-dismissible fade show";
    errorAlert.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      <span id="errorMessage">${message}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.getElementById("donateForm");
    form.parentNode.insertBefore(errorAlert, form);
  } else {
    document.getElementById("errorMessage").textContent = message;
    errorAlert.style.display = "block";
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorAlert.style.display = "none";
  }, 5000);
}

// Make functions globally available
window.removeImage = removeImage;
