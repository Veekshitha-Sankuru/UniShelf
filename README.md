# 📚 Library Management System

A complete Library Management System built as a B.Tech CSE student project using HTML, CSS, JavaScript, Axios, and JSON Server.

---

## 🛠️ Technologies Used

| Technology   | Purpose                              |
|--------------|--------------------------------------|
| HTML5        | Structure and layout                 |
| CSS3         | Styling and responsive design        |
| JavaScript   | DOM manipulation and logic           |
| Axios        | HTTP requests to JSON Server         |
| JSON Server  | Fake REST API backend using db.json  |

---

## ✨ Features

1. **Dashboard** — Shows total, available, and issued book counts with recent books
2. **Add Book** — Form with validation to add new books via POST request
3. **View Books** — Table with all books, with status badges
4. **Edit Book** — Edit any book's details in a modal dialog via PUT request
5. **Delete Book** — Delete a book with confirmation dialog via DELETE request
6. **Search** — Live search by title or author
7. **Filter by Category** — Dropdown to filter books by category
8. **Status Filter** — View All / Available / Issued books
9. **Issue Book** — Change a book's status from Available → Issued via PATCH
10. **Return Book** — Change a book's status from Issued → Available via PATCH

---

## 📁 Project Structure

```
library-management/
│
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   └── script.js       # All JavaScript logic
├── db.json             # JSON Server database with sample data
└── README.md           # This file
```

---

## 🚀 How to Run the Project

### Step 1 — Install JSON Server

Open a terminal and run:

```bash
npm install -g json-server
```

> If you don't have Node.js, download it from https://nodejs.org first.

---

### Step 2 — Start the JSON Server

Navigate to the project folder:

```bash
cd library-management
```

Start JSON Server pointing to db.json:

```bash
json-server --watch db.json --port 3000
```

You should see output like:
```
Resources
  http://localhost:3000/books

Home
  http://localhost:3000
```

> Keep this terminal open while using the app.

---

### Step 3 — Open the App

Open `index.html` in your browser directly, or use a Live Server extension (VS Code) for the best experience.

- Right-click `index.html` → Open with Live Server
- OR open: `file:///path-to-project/library-management/index.html`

---

## 🌐 API Endpoints

| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /books          | Get all books        |
| POST   | /books          | Add a new book       |
| PUT    | /books/:id      | Update a book        |
| PATCH  | /books/:id      | Update book status   |
| DELETE | /books/:id      | Delete a book        |

---

## 📦 Book Model

```json
{
  "id": 1,
  "title": "Book Title",
  "author": "Author Name",
  "category": "Fiction",
  "price": 299,
  "status": "Available"
}
```

Status can be: `"Available"` or `"Issued"`

---

## 📝 Notes

- JSON Server automatically saves changes to `db.json`.
- Axios is loaded from CDN — no extra install needed for the frontend.
- The app runs entirely in the browser with no build step required.

---

## 👨‍💻 Author

B.Tech CSE — 3rd Year Student Project  
Subject: Web Technology / Full Stack Development Lab
