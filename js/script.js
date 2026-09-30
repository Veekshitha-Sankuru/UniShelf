/**
 * UniShelf — script.js
 * Main app logic. Runs on index.html.
 */

// ============================================================
// AUTH GUARD
// ============================================================
if (sessionStorage.getItem("bv_logged_in") !== "yes") {
  window.location.href = "login.html";
}

// ============================================================
// CONFIG
// ============================================================
// Uses Render backend in production, localhost in development
var API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:3000/books"
  : "https://unishelf-backend.onrender.com/books";

// Open Library cover API — fetches a real cover image by title search
function getCoverUrl(title, author) {
  var query = encodeURIComponent(title + " " + (author || ""));
  // Returns a placeholder cover built from Open Library search
  return "https://covers.openlibrary.org/b/olid/" + encodeURIComponent(title.replace(/\s+/g,"")) + "-M.jpg";
}

// Deterministic color class for fallback covers
var COVER_COLORS = 12;
function coverClass(id) {
  var n = 0;
  var s = String(id || "0");
  for (var i = 0; i < s.length; i++) n += s.charCodeAt(i);
  return "cover-c" + (n % COVER_COLORS);
}

// Category emoji map
var CAT_EMOJI = {
  "Fiction":          "📖",
  "Computer Science": "💻",
  "History":          "🏛️",
  "Self Help":        "🌱",
  "Biography":        "👤",
  "Science":          "🔬",
  "Other":            "📦"
};

// Verified Open Library ISBNs for authentic real covers matching each book title
var BOOK_COVER_MAP = {
  "the great gatsby":            "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg?default=false",
  "introduction to algorithms": "https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg?default=false",
  "clean code":                  "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg?default=false",
  "operating system concepts":   "https://covers.openlibrary.org/b/isbn/9781118063330-M.jpg?default=false",
  "wings of fire":               "https://covers.openlibrary.org/b/isbn/9788173711466-M.jpg?default=false",
  "think and grow rich":         "https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg?default=false",
  "a brief history of time":     "https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg?default=false",
  "verity":                      "https://covers.openlibrary.org/b/isbn/9781538724736-M.jpg?default=false",
  "atomic habits":               "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg?default=false",
  "to kill a mockingbird":       "https://covers.openlibrary.org/b/isbn/9780060935467-M.jpg?default=false",
  "the pragmatic programmer":    "https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg?default=false",
  "cosmos":                      "https://covers.openlibrary.org/b/isbn/9780345539434-M.jpg?default=false",
  "steve jobs":                  "https://covers.openlibrary.org/b/isbn/9781451648539-M.jpg?default=false",
  "the diary of a young girl":   "https://covers.openlibrary.org/b/isbn/9780553296983-M.jpg?default=false",
  "design patterns":             "https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg?default=false",
  "ikigai":                      "https://covers.openlibrary.org/b/isbn/9780143130727-M.jpg?default=false",
  "the origin of species":       "https://covers.openlibrary.org/b/isbn/9780451529060-M.jpg?default=false",
  "1984":                        "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false",
  "long walk to freedom":        "https://covers.openlibrary.org/b/isbn/9780316548182-M.jpg?default=false",
  "guns, germs, and steel":      "https://covers.openlibrary.org/b/isbn/9780393317558-M.jpg?default=false",
  "deep work":                   "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg?default=false",
  "the selfish gene":            "https://covers.openlibrary.org/b/isbn/9780199291151-M.jpg?default=false",
  "brave new world":             "https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg?default=false",
  "god of malice":               "https://covers.openlibrary.org/b/isbn/9781685551940-M.jpg?default=false",
  "sapiens":                     "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg?default=false",
  "the alchemist":               "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg?default=false"
};

function getCategoryTheme(category) {
  var cat = (category || "").toLowerCase();
  if (cat.indexOf("fiction") !== -1) return "theme-fiction";
  if (cat.indexOf("computer") !== -1 || cat.indexOf("code") !== -1 || cat.indexOf("tech") !== -1) return "theme-cs";
  if (cat.indexOf("science") !== -1) return "theme-science";
  if (cat.indexOf("self") !== -1) return "theme-selfhelp";
  if (cat.indexOf("bio") !== -1) return "theme-biography";
  if (cat.indexOf("hist") !== -1) return "theme-history";
  return "theme-other";
}

function getBookCoverUrl(book) {
  if (!book) return null;
  if (book.coverUrl) return book.coverUrl;
  if (book.cover) return book.cover;
  var key = (book.title || "").toLowerCase().trim();
  if (BOOK_COVER_MAP[key]) return BOOK_COVER_MAP[key];
  for (var k in BOOK_COVER_MAP) {
    if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) {
      return BOOK_COVER_MAP[k];
    }
  }
  return null;
}

// ============================================================
// STATE
// ============================================================
var allBooks = [];
var activeStatusFilter = "all";

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
var sidebarBtns = document.querySelectorAll(".sidebar-btn");
var sections    = document.querySelectorAll(".section");

function switchToSection(name) {
  sidebarBtns.forEach(function(b) {
    b.classList.toggle("active", b.dataset.section === name);
  });
  sections.forEach(function(s) {
    s.classList.toggle("active", s.id === "section-" + name);
  });
  if (name === "books") renderCatalogue(getFilteredBooks());
  closeSidebar();
}

sidebarBtns.forEach(function(btn) {
  btn.addEventListener("click", function() { switchToSection(btn.dataset.section); });
});

// Hero buttons
document.querySelectorAll("[data-section]").forEach(function(el) {
  if (el.classList.contains("sidebar-btn")) return;
  el.addEventListener("click", function() { switchToSection(el.dataset.section); });
});

// ============================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================
var sidebar         = document.getElementById("sidebar");
var sidebarOverlay  = document.getElementById("sidebar-overlay");
var mobileMenuBtn   = document.getElementById("mobile-menu-btn");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
  sidebarOverlay.classList.remove("hidden");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  sidebarOverlay.classList.add("hidden");
}
if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

// ============================================================
// LOGOUT
// ============================================================
document.getElementById("logout-btn").addEventListener("click", function() {
  sessionStorage.removeItem("bv_logged_in");
  window.location.href = "login.html";
});

// ============================================================
// TOAST
// ============================================================
function showToast(message, type) {
  type = type || "info";
  var icons = {
    success: '<svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;flex-shrink:0"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    error:   '<svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;flex-shrink:0"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    info:    '<svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;flex-shrink:0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
  };
  var toast = document.getElementById("toast");
  toast.innerHTML = (icons[type] || icons.info) + "<span>" + message + "</span>";
  toast.className = "toast " + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.className = "toast hidden"; }, 3500);
}

// ============================================================
// API — Axios wrappers
// ============================================================
async function fetchBooks() {
  try {
    var res = await axios.get(API_URL);
    allBooks = res.data;
    document.getElementById("server-banner").classList.add("hidden");
    return true;
  } catch(err) {
    document.getElementById("server-banner").classList.remove("hidden");
    showToast("Cannot reach JSON Server on port 3000.", "error");
    return false;
  }
}
async function apiAddBook(data) {
  try { return (await axios.post(API_URL, data)).data; }
  catch(err) { showToast("Failed to add book.", "error"); return null; }
}
async function apiUpdateBook(id, data) {
  try { return (await axios.put(API_URL + "/" + id, data)).data; }
  catch(err) { showToast("Failed to update book.", "error"); return null; }
}
async function apiDeleteBook(id) {
  try { await axios.delete(API_URL + "/" + id); return true; }
  catch(err) { showToast("Failed to delete book.", "error"); return false; }
}
async function apiPatchStatus(id, status) {
  try { return (await axios.patch(API_URL + "/" + id, { status: status })).data; }
  catch(err) { showToast("Failed to update status.", "error"); return null; }
}

// ============================================================
// BUILD BOOK CARD HTML (3D Realistic Hardcover Book)
// ============================================================
function buildBookCard(book, showActions) {
  var coverUrl   = getBookCoverUrl(book);
  var themeCls   = getCategoryTheme(book.category);
  var isAvail    = book.status === "Available";
  var safeId     = esc(book.id);
  var safeTitle  = esc(book.title || "Untitled");
  var safeAuthor = esc(book.author || "Unknown Author");
  var safeCat    = esc(book.category || "General");

  // Real Book Cover Image
  var imageHtml = coverUrl
    ? '<img class="card-hardcover-img" src="' + coverUrl + '" alt="' + safeTitle + '" '
      + 'loading="lazy" '
      + 'onerror="this.remove();">'
    : '';

  // 3D Realistic Hardcover Book Presentation
  var coverHtml = '<div class="book-card-cover-wrap">'
    + '<div class="card-hardcover-scene ' + themeCls + '">'
    +   '<div class="card-hardcover-book" title="' + safeTitle + '">'
    +     '<div class="card-hardcover-spine"></div>'
    +     '<div class="card-hardcover-cover">'
    +       '<div class="card-hardcover-emboss">'
    +         '<span class="card-cover-cat">' + safeCat + '</span>'
    +         '<p class="card-cover-title">' + safeTitle + '</p>'
    +         '<p class="card-cover-author">' + safeAuthor + '</p>'
    +       '</div>'
    +       imageHtml
    +       '<div class="card-gold-trim"></div>'
    +       '<div class="card-cover-shine"></div>'
    +     '</div>'
    +     '<div class="card-hardcover-pages"></div>'
    +   '</div>'
    +   '<div class="card-hardcover-shadow"></div>'
    + '</div>'
    + '</div>';

  var actionsHtml = "";
  if (showActions) {
    var issueReturnBtn = isAvail
      ? '<button class="card-btn btn-issue" data-id="' + safeId + '" title="Mark as Issued">'
        + '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>'
        + 'Issue</button>'
      : '<button class="card-btn btn-return" data-id="' + safeId + '" title="Mark as Returned">'
        + '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
        + 'Return</button>';

    actionsHtml = '<div class="book-card-actions">'
      + '<button class="card-btn btn-edit" data-id="' + safeId + '" title="Edit Book">'
      + '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>'
      + 'Edit</button>'
      + '<button class="card-btn btn-del" data-id="' + safeId + '" title="Delete Book">'
      + '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
      + 'Delete</button>'
      + issueReturnBtn
      + '</div>';
  }

  return '<div class="book-card" data-id="' + safeId + '">'
    + coverHtml
    + '<div class="book-card-body">'
    + '<div class="book-card-title" title="' + esc(book.title) + '">' + esc(book.title) + '</div>'
    + '<div class="book-card-author">by ' + esc(book.author) + '</div>'
    + '<div class="book-card-meta">'
    + '<span class="cat-chip">' + esc(book.category) + '</span>'
    + '<span class="status-pill-chip ' + (isAvail ? "available" : "issued") + '">'
    + '<span class="status-dot ' + (isAvail ? "available" : "issued") + '"></span>'
    + (isAvail ? "Available" : "Issued")
    + '</span>'
    + '</div>'
    + '</div>'
    + actionsHtml
    + '</div>';
}

// ============================================================
// DASHBOARD
// ============================================================
function updateDashboard() {
  var total     = allBooks.length;
  var available = allBooks.filter(function(b) { return b.status === "Available"; }).length;
  var issued    = allBooks.filter(function(b) { return b.status === "Issued"; }).length;
  var pct       = total > 0 ? Math.round((available / total) * 100) : 0;

  // Numbers
  document.getElementById("stat-total").textContent     = total;
  document.getElementById("stat-available").textContent = available;
  document.getElementById("stat-issued").textContent    = issued;

  // Circulation progress meter & badges
  var fillEl = document.getElementById("avail-progress-fill");
  if (fillEl) fillEl.style.width = pct + "%";
  var rateEl = document.getElementById("stat-circulation-rate");
  if (rateEl) rateEl.textContent = pct + "% of collection ready for loan";
  var rateBadge = document.getElementById("rate-badge");
  if (rateBadge) rateBadge.textContent = pct + "% Avail";

  // Dynamic time-based greeting in hero
  var greetingEl = document.getElementById("hero-greeting");
  if (greetingEl) {
    var hr = new Date().getHours();
    var txt = "Good evening, Librarian";
    if (hr < 12) txt = "Good morning, Librarian";
    else if (hr < 17) txt = "Good afternoon, Librarian";
    greetingEl.innerHTML = '<span class="eyebrow-dot"></span><span>' + txt + ' • Campus Hub</span>';
  }

  // Sidebar mini stats
  document.getElementById("sidebar-available").textContent = available;
  document.getElementById("sidebar-issued").textContent    = issued;
  document.getElementById("nav-total-badge").textContent   = total;

  renderRecentBooks();
}

function renderRecentBooks() {
  var container = document.getElementById("recent-books-list");
  var recent    = allBooks.slice(-8).reverse();

  if (!recent.length) {
    container.innerHTML = "<p style='color:var(--text-muted);padding:24px 0;font-size:0.92rem'>No volumes registered yet. Add some to get started.</p>";
    return;
  }
  container.innerHTML = recent.map(function(b) { return buildBookCard(b, false); }).join("");
}

// ============================================================
// CATALOGUE
// ============================================================
function getFilteredBooks() {
  var query    = document.getElementById("search-input").value.trim().toLowerCase();
  var category = document.getElementById("category-filter").value;

  return allBooks.filter(function(book) {
    var matchSearch   = !query
      || book.title.toLowerCase().indexOf(query)  !== -1
      || book.author.toLowerCase().indexOf(query) !== -1;
    var matchCategory = category === "all" || book.category === category;
    var matchStatus   = activeStatusFilter === "all" || book.status === activeStatusFilter;
    return matchSearch && matchCategory && matchStatus;
  });
}

function renderCatalogue(books) {
  var grid      = document.getElementById("catalogue-grid");
  var noResults = document.getElementById("no-results");
  var countEl   = document.getElementById("catalogue-count");

  if (countEl) {
    countEl.textContent = books.length + (books.length === 1 ? " Volume" : " Volumes");
  }

  if (!books || books.length === 0) {
    grid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");
  grid.innerHTML = books.map(function(b) { return buildBookCard(b, true); }).join("");
}


// ============================================================
// CATALOGUE GRID — event delegation
// ============================================================
document.getElementById("catalogue-grid").addEventListener("click", function(e) {
  var btn = e.target.closest("button");
  if (!btn) return;
  var id = btn.getAttribute("data-id");
  if (!id) return;
  if (btn.classList.contains("btn-edit"))   handleEdit(id);
  if (btn.classList.contains("btn-del"))    handleDelete(id);
  if (btn.classList.contains("btn-issue"))  handleIssue(id);
  if (btn.classList.contains("btn-return")) handleReturn(id);
});

// ============================================================
// SEARCH & FILTERS
// ============================================================
document.getElementById("search-input").addEventListener("input", function() {
  renderCatalogue(getFilteredBooks());
});
document.getElementById("category-filter").addEventListener("change", function() {
  renderCatalogue(getFilteredBooks());
});
document.querySelectorAll(".spill").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".spill").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    activeStatusFilter = btn.dataset.status;
    renderCatalogue(getFilteredBooks());
  });
});

// ============================================================
// DELETE
// ============================================================
async function handleDelete(id) {
  var book = allBooks.find(function(b) { return String(b.id) === String(id); });
  if (!book) return;
  if (!confirm('Delete "' + book.title + '"?\n\nThis cannot be undone.')) return;
  var ok = await apiDeleteBook(id);
  if (ok) {
    allBooks = allBooks.filter(function(b) { return String(b.id) !== String(id); });
    showToast('"' + book.title + '" deleted.', "success");
    updateDashboard();
    renderCatalogue(getFilteredBooks());
  }
}

// ============================================================
// ISSUE & RETURN
// ============================================================
async function handleIssue(id) {
  var res = await apiPatchStatus(id, "Issued");
  if (res) {
    var book = allBooks.find(function(b) { return String(b.id) === String(id); });
    if (book) book.status = "Issued";
    showToast('"' + (book ? book.title : "Book") + '" issued!', "success");
    updateDashboard();
    renderCatalogue(getFilteredBooks());
  }
}
async function handleReturn(id) {
  var res = await apiPatchStatus(id, "Available");
  if (res) {
    var book = allBooks.find(function(b) { return String(b.id) === String(id); });
    if (book) book.status = "Available";
    showToast('"' + (book ? book.title : "Book") + '" returned!', "success");
    updateDashboard();
    renderCatalogue(getFilteredBooks());
  }
}

// ============================================================
// ADD BOOK — with live preview
// ============================================================
function clearAddErrors() {
  ["err-title","err-author","err-category"].forEach(function(id) {
    document.getElementById(id).textContent = "";
  });
  ["add-title","add-author","add-category"].forEach(function(id) {
    document.getElementById(id).classList.remove("input-error");
  });
}

// Live preview update
function updatePreview() {
  var title    = document.getElementById("add-title").value.trim()    || "Book Title";
  var author   = document.getElementById("add-author").value.trim()   || "Author Name";
  var category = document.getElementById("add-category").value        || "Category";
  var themeCls = getCategoryTheme(category);

  var titleEl = document.getElementById("preview-title");
  var authorEl = document.getElementById("preview-author");
  var catEl = document.getElementById("preview-cat");
  if (titleEl)  titleEl.textContent  = title;
  if (authorEl) authorEl.textContent = author;
  if (catEl)    catEl.textContent    = category;

  var sceneEl = document.querySelector(".add-preview-card .hardcover-scene");
  if (sceneEl) {
    sceneEl.className = "hardcover-scene " + themeCls;
  }

  var coverEl = document.getElementById("preview-cover");
  if (coverEl) {
    coverEl.className = "hardcover-cover " + themeCls;
    var coverUrl = getBookCoverUrl({ title: title });
    var existingImg = coverEl.querySelector(".hardcover-preview-img");
    if (coverUrl) {
      if (!existingImg) {
        existingImg = document.createElement("img");
        existingImg.className = "hardcover-preview-img card-hardcover-img";
        existingImg.onerror = function() { this.remove(); };
        coverEl.appendChild(existingImg);
      }
      existingImg.src = coverUrl;
    } else if (existingImg) {
      existingImg.remove();
    }
  }
}
document.getElementById("add-title").addEventListener("input", updatePreview);
document.getElementById("add-author").addEventListener("input", updatePreview);
document.getElementById("add-category").addEventListener("change", updatePreview);

function validateAddForm() {
  clearAddErrors();
  var valid = true;
  var title    = document.getElementById("add-title");
  var author   = document.getElementById("add-author");
  var category = document.getElementById("add-category");
  if (!title.value.trim())  { document.getElementById("err-title").textContent = "Title is required."; title.classList.add("input-error"); valid = false; }
  if (!author.value.trim()) { document.getElementById("err-author").textContent = "Author is required."; author.classList.add("input-error"); valid = false; }
  if (!category.value)      { document.getElementById("err-category").textContent = "Please select a category."; category.classList.add("input-error"); valid = false; }
  return valid;
}

document.getElementById("add-book-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  if (!validateAddForm()) return;

  var newBook = {
    title:    document.getElementById("add-title").value.trim(),
    author:   document.getElementById("add-author").value.trim(),
    category: document.getElementById("add-category").value,
    status:   "Available"
  };

  var btn = document.getElementById("add-submit-btn");
  btn.disabled = true; btn.textContent = "Adding…";

  var created = await apiAddBook(newBook);

  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg> Add to Catalogue';

  if (created) {
    allBooks.push(created);
    showToast('"' + created.title + '" added to UniShelf!', "success");
    updateDashboard();
    document.getElementById("add-book-form").reset();
    clearAddErrors();
    updatePreview();
    switchToSection("books");
  }
});

document.getElementById("reset-form-btn").addEventListener("click", function() {
  document.getElementById("add-book-form").reset();
  clearAddErrors();
  updatePreview();
});

// ============================================================
// EDIT BOOK — Modal
// ============================================================
function handleEdit(id) {
  var book = allBooks.find(function(b) { return String(b.id) === String(id); });
  if (!book) return;
  document.getElementById("edit-id").value       = book.id;
  document.getElementById("edit-title").value    = book.title;
  document.getElementById("edit-author").value   = book.author;
  document.getElementById("edit-category").value = book.category;
  ["edit-err-title","edit-err-author","edit-err-category"].forEach(function(eid) {
    document.getElementById(eid).textContent = "";
  });
  ["edit-title","edit-author","edit-category"].forEach(function(eid) {
    document.getElementById(eid).classList.remove("input-error");
  });
  document.getElementById("edit-modal").classList.remove("hidden");
}

function closeEditModal() { document.getElementById("edit-modal").classList.add("hidden"); }
document.getElementById("modal-close-btn").addEventListener("click", closeEditModal);
document.getElementById("cancel-edit-btn").addEventListener("click", closeEditModal);
document.getElementById("edit-modal").addEventListener("click", function(e) { if (e.target === this) closeEditModal(); });

function validateEditForm() {
  var valid = true;
  ["edit-err-title","edit-err-author","edit-err-category"].forEach(function(id) { document.getElementById(id).textContent = ""; });
  ["edit-title","edit-author","edit-category"].forEach(function(id) { document.getElementById(id).classList.remove("input-error"); });
  var title    = document.getElementById("edit-title");
  var author   = document.getElementById("edit-author");
  var category = document.getElementById("edit-category");
  if (!title.value.trim())  { document.getElementById("edit-err-title").textContent = "Title is required."; title.classList.add("input-error"); valid = false; }
  if (!author.value.trim()) { document.getElementById("edit-err-author").textContent = "Author is required."; author.classList.add("input-error"); valid = false; }
  if (!category.value)      { document.getElementById("edit-err-category").textContent = "Select a category."; category.classList.add("input-error"); valid = false; }
  return valid;
}

document.getElementById("edit-book-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  if (!validateEditForm()) return;

  var id = document.getElementById("edit-id").value;
  var existingBook = allBooks.find(function(b) { return String(b.id) === String(id); });

  var updatedBook = {
    title:    document.getElementById("edit-title").value.trim(),
    author:   document.getElementById("edit-author").value.trim(),
    category: document.getElementById("edit-category").value,
    status:   existingBook ? existingBook.status : "Available"
  };

  var saveBtn = document.querySelector("#edit-book-form button[type='submit']");
  saveBtn.disabled = true; saveBtn.textContent = "Saving…";

  var result = await apiUpdateBook(id, updatedBook);

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Save Changes';

  if (result) {
    var idx = allBooks.findIndex(function(b) { return String(b.id) === String(id); });
    if (idx !== -1) allBooks[idx] = Object.assign({ id: id }, updatedBook);
    showToast('"' + updatedBook.title + '" updated!', "success");
    closeEditModal();
    updateDashboard();
    renderCatalogue(getFilteredBooks());
  }
});

// ============================================================
// XSS HELPER
// ============================================================
function esc(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ============================================================
// KEYBOARD SHORTCUTS & SEARCH ENHANCEMENTS
// ============================================================
var searchInput    = document.getElementById("search-input");
var searchClearBtn = document.getElementById("search-clear-btn");

if (searchInput && searchClearBtn) {
  searchInput.addEventListener("input", function() {
    searchClearBtn.classList.toggle("hidden", !searchInput.value.trim());
  });

  searchClearBtn.addEventListener("click", function() {
    searchInput.value = "";
    searchClearBtn.classList.add("hidden");
    renderCatalogue(getFilteredBooks());
    searchInput.focus();
  });
}

// Global hotkeys: Ctrl+K or / to search, Escape to close modal/search
document.addEventListener("keydown", function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    switchToSection("books");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT" && document.activeElement.tagName !== "TEXTAREA") {
    e.preventDefault();
    switchToSection("books");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else if (e.key === "Escape") {
    closeEditModal();
  }
});

// ============================================================
// INIT
// ============================================================
async function init() {
  var ok = await fetchBooks();
  if (ok) {
    updateDashboard();
    renderCatalogue(getFilteredBooks());
  }
}

init();

