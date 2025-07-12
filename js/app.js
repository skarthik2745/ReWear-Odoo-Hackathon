// Store donated item in localStorage
if (document.getElementById("donateForm")) {
  document
    .getElementById("donateForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = document.getElementById("submitBtn");
      const submitBtnText = document.getElementById("submitBtnText");
      const submitBtnSpinner = document.getElementById("submitBtnSpinner");
      submitBtn.disabled = true;
      submitBtnText.classList.add("d-none");
      submitBtnSpinner.classList.remove("d-none");

      const item = {
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("itemCategory").value,
        size: document.getElementById("itemSize").value.trim(),
        condition: document.getElementById("itemCondition").value,
        donorName: document.getElementById("donorName").value.trim(),
        donorEmail: document.getElementById("donorEmail").value.trim(),
        donorMobile: document.getElementById("donorMobile").value.trim(),
        donorAddress: document.getElementById("donorAddress").value.trim(),
        image: "",
        dateAdded: new Date().toISOString(),
      };

      const imgInput = document.getElementById("itemImage");
      if (imgInput.files && imgInput.files[0]) {
        const file = imgInput.files[0];
        if (file.size > 1024 * 1024 * 2) {
          // 2MB limit
          alert("Image is too large. Please upload an image smaller than 2MB.");
          submitBtn.disabled = false;
          submitBtnText.classList.remove("d-none");
          submitBtnSpinner.classList.add("d-none");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
          item.image = evt.target.result;
          if (!item.image.startsWith("data:image")) {
            alert("Invalid image format. Please upload a valid image file.");
            submitBtn.disabled = false;
            submitBtnText.classList.remove("d-none");
            submitBtnSpinner.classList.add("d-none");
            return;
          }
          saveItem(item);
        };
        reader.onerror = function () {
          alert("Failed to read image. Please try again.");
          submitBtn.disabled = false;
          submitBtnText.classList.remove("d-none");
          submitBtnSpinner.classList.add("d-none");
        };
        reader.readAsDataURL(file);
      } else {
        saveItem(item);
      }

      function saveItem(item) {
        const items = JSON.parse(localStorage.getItem("rewearItems") || "[]");
        items.push(item);
        localStorage.setItem("rewearItems", JSON.stringify(items));
        // Show success message
        const successAlert = document.getElementById("successAlert");
        if (successAlert) {
          successAlert.style.display = "block";
          successAlert.scrollIntoView({ behavior: "smooth" });
        }
        // Reset form after submission
        document.getElementById("donateForm").reset();
        document.getElementById("imgPreview").src = "";
        document.getElementById("imgPreviewContainer").style.display = "none";
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "browse.html";
        }, 2000);
      }
    });
}

// Display items on browse.html
if (document.getElementById("itemsGrid")) {
  const items = JSON.parse(localStorage.getItem("rewearItems") || "[]");
  const grid = document.getElementById("itemsGrid");
  const noItemsMsg = document.getElementById("noItemsMsg");

  if (items.length === 0) {
    noItemsMsg.style.display = "block";
  } else {
    noItemsMsg.style.display = "none";
    items.reverse().forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mb-4";

      // Format date
      const dateAdded = new Date(item.dateAdded);
      const formattedDate = dateAdded.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // Determine if image is uploaded and valid
      const hasCustomImage =
        item.image &&
        typeof item.image === "string" &&
        item.image.startsWith("data:image");
      const imageSrc = hasCustomImage
        ? item.image
        : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80";

      card.innerHTML = `
        <div class="item-card h-100 d-flex flex-column">
          <div class="item-image-container mb-3">
            <img src="${imageSrc}" 
                 alt="${item.name}" 
                 class="item-img w-100" 
                 onload="this.style.opacity='1'"
                 onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'; this.style.opacity='1'"
                 style="opacity: 0; transition: opacity 0.3s ease;"
                 onclick="openImageModal('${imageSrc}')">
            <div class="image-overlay" onclick="openImageModal('${imageSrc}')">
              <div class="zoom-icon">
                <i class="fas fa-search-plus"></i>
              </div>
            </div>
            ${
              hasCustomImage
                ? '<div class="image-quality">📸 Donor Photo</div>'
                : '<div class="image-quality">🖼️ Stock Image</div>'
            }
          </div>
          <div class="item-details flex-grow-1">
            <h5 class="fw-bold mb-2 text-truncate">${item.name}</h5>
            <div class="badges mb-2">
              <span class="badge bg-success me-1">${item.category}</span>
              <span class="badge bg-secondary me-1">${item.size}</span>
            </div>
            <div class="condition-badge mb-2">
              <span class="badge bg-info">${item.condition}</span>
            </div>
            <div class="donor-info mb-3">
              <small class="text-muted">
                <i class="fas fa-user me-1"></i>Donated by: ${item.donorName}
              </small>
              <br>
              <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>${formattedDate}
              </small>
            </div>
            <div class="contact-section">
              <h6 class="fw-bold mb-2">
                <i class="fas fa-address-card me-1"></i>Donor Contact
              </h6>
              <div class="contact-details small mb-3">
                <div class="mb-1">
                  <i class="fas fa-envelope me-1"></i>${item.donorEmail}
                </div>
                <div class="mb-1">
                  <i class="fas fa-phone me-1"></i>${item.donorMobile}
                </div>
                <div class="mb-1">
                  <i class="fas fa-map-marker-alt me-1"></i>${item.donorAddress}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-auto">
            <a href="mailto:${
              item.donorEmail
            }?subject=Interested%20in%20your%20donated%20item:%20${encodeURIComponent(
        item.name
      )}&body=Hi%20${
        item.donorName
      },%0A%0AI'm%20interested%20in%20your%20donated%20item:%20${encodeURIComponent(
        item.name
      )}%0A%0APlease%20let%20me%20know%20if%20it's%20still%20available%20and%20how%20we%20can%20arrange%20pickup.%0A%0AThank%20you!" class="btn btn-eco w-100">
              <i class="fas fa-envelope me-2"></i>Contact Donor
            </a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// Global function for opening image modal (accessible from HTML)
function openImageModal(imgSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  if (modal && modalImg) {
    modal.style.display = "block";
    modalImg.src = imgSrc;
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("imageModal");
  if (event.target == modal) {
    closeImageModal();
  }
};

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeImageModal();
  }
});
