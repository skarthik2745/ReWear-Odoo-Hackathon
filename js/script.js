// ReWear - Main JavaScript
// Landing page functionality and animations

document.addEventListener("DOMContentLoaded", function () {
  // Initialize loading state
  showLoadingSpinner();

  // Check Firebase connection
  if (typeof firebase !== "undefined") {
    console.log("Firebase loaded successfully");
    hideLoadingSpinner();
  } else {
    console.error("Firebase not loaded");
    hideLoadingSpinner();
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".feature-card, .badge-card, .stat-card, .leaderboard-item"
  );
  animateElements.forEach((el) => {
    observer.observe(el);
  });

  // Hero section animations
  animateHeroSection();

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Add hover effects to buttons
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Stats counter animation
  animateStats();
});

// Loading spinner functions
function showLoadingSpinner() {
  const spinner = document.createElement("div");
  spinner.id = "loading-spinner";
  spinner.className = "loading-spinner";
  spinner.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
  document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.opacity = "0";
    setTimeout(() => {
      spinner.remove();
    }, 300);
  }
}

// Hero section animations
function animateHeroSection() {
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelector(".hero-buttons");

  if (heroTitle) {
    setTimeout(() => {
      heroTitle.style.opacity = "1";
      heroTitle.style.transform = "translateY(0)";
    }, 500);
  }

  if (heroSubtitle) {
    setTimeout(() => {
      heroSubtitle.style.opacity = "1";
      heroSubtitle.style.transform = "translateY(0)";
    }, 700);
  }

  if (heroButtons) {
    setTimeout(() => {
      heroButtons.style.opacity = "1";
      heroButtons.style.transform = "translateY(0)";
    }, 900);
  }
}

// Stats counter animation
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const finalValue = target.textContent;
          const numericValue = parseInt(finalValue.replace(/\D/g, ""));

          if (numericValue > 0) {
            animateCounter(target, 0, numericValue, 2000);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((stat) => observer.observe(stat));
}

function animateCounter(element, start, end, duration) {
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current.toLocaleString() + "+";

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

// Utility functions
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Check if user is authenticated
function checkAuthStatus() {
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in
        updateNavbarForAuthenticatedUser(user);
      } else {
        // User is signed out
        updateNavbarForUnauthenticatedUser();
      }
    });
  }
}

function updateNavbarForAuthenticatedUser(user) {
  const loginLink = document.querySelector('a[href="login.html"]');
  const signupLink = document.querySelector('a[href="signup.html"]');

  if (loginLink) {
    loginLink.href = "dashboard.html";
    loginLink.innerHTML = '<i class="fas fa-user me-2"></i>Dashboard';
  }

  if (signupLink) {
    signupLink.href = "#";
    signupLink.innerHTML = '<i class="fas fa-sign-out-alt me-2"></i>Logout';
    signupLink.onclick = function (e) {
      e.preventDefault();
      logout();
    };
  }
}

function updateNavbarForUnauthenticatedUser() {
  const loginLink = document.querySelector('a[href="dashboard.html"]');
  const signupLink = document.querySelector('a[href="#"]');

  if (loginLink) {
    loginLink.href = "login.html";
    loginLink.innerHTML = "Login";
  }

  if (signupLink) {
    signupLink.href = "signup.html";
    signupLink.innerHTML = "Sign Up";
    signupLink.onclick = null;
  }
}

function logout() {
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(function () {
        showNotification("Successfully logged out!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(function (error) {
        showNotification("Error logging out: " + error.message, "danger");
      });
  }
}

// Initialize auth check when Firebase is ready
if (typeof firebase !== "undefined") {
  checkAuthStatus();
} else {
  // Wait for Firebase to load
  window.addEventListener("load", function () {
    setTimeout(checkAuthStatus, 1000);
  });
}
