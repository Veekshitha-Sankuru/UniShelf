/**
 * UniShelf — login.js
 * Handles login form on login.html
 * On success, redirects to index.html
 */

var VALID_USERNAME = "admin";
var VALID_PASSWORD = "admin123";

// If already logged in, skip the login page
if (sessionStorage.getItem("bv_logged_in") === "yes") {
  window.location.href = "index.html";
}

// Show / hide password toggle — swap SVG icons
document.getElementById("toggle-pw").addEventListener("click", function () {
  var input     = document.getElementById("login-password");
  var eyeOpen   = document.getElementById("eye-open");
  var eyeClosed = document.getElementById("eye-closed");

  if (input.type === "password") {
    input.type = "text";
    eyeOpen.classList.add("hidden");
    eyeClosed.classList.remove("hidden");
  } else {
    input.type = "password";
    eyeOpen.classList.remove("hidden");
    eyeClosed.classList.add("hidden");
  }
});

// Login form submit
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  var usernameInput = document.getElementById("login-username");
  var passwordInput = document.getElementById("login-password");
  var username      = usernameInput.value.trim();
  var password      = passwordInput.value;

  // Clear previous errors
  document.getElementById("err-username").textContent = "";
  document.getElementById("err-password").textContent = "";
  document.getElementById("err-general").textContent  = "";
  document.getElementById("wrap-username").classList.remove("input-error-wrap");
  document.getElementById("wrap-password").classList.remove("input-error-wrap");

  var valid = true;

  if (!username) {
    document.getElementById("err-username").textContent = "Username is required.";
    document.getElementById("wrap-username").classList.add("input-error-wrap");
    valid = false;
  }
  if (!password) {
    document.getElementById("err-password").textContent = "Password is required.";
    document.getElementById("wrap-password").classList.add("input-error-wrap");
    valid = false;
  }
  if (!valid) return;

  // Check credentials
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    sessionStorage.setItem("bv_logged_in", "yes");

    // Button feedback then redirect
    var btn         = document.getElementById("login-btn");
    btn.disabled    = true;
    btn.textContent = "Signing in…";

    setTimeout(function () {
      window.location.href = "index.html";
    }, 500);

  } else {
    document.getElementById("err-general").textContent = "Incorrect username or password.";

    // Shake the card
    var card = document.getElementById("login-card");
    card.classList.add("shake");
    setTimeout(function () { card.classList.remove("shake"); }, 500);

    // Clear password field
    passwordInput.value = "";
    passwordInput.focus();
  }
});

// Quick 1-click Demo Autofill
var autofillBtn = document.getElementById("btn-autofill");
if (autofillBtn) {
  autofillBtn.addEventListener("click", function () {
    var usernameInput = document.getElementById("login-username");
    var passwordInput = document.getElementById("login-password");
    usernameInput.value = VALID_USERNAME;
    passwordInput.value = VALID_PASSWORD;
    document.getElementById("err-username").textContent = "";
    document.getElementById("err-password").textContent = "";
    document.getElementById("err-general").textContent = "";
    document.getElementById("wrap-username").classList.remove("input-error-wrap");
    document.getElementById("wrap-password").classList.remove("input-error-wrap");
    document.getElementById("login-btn").focus();
  });
}
