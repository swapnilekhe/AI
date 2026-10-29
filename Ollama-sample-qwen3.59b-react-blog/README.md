# React Blog Application

A modern React blog website built with Vite, featuring Google Authentication via Firebase and Excel-based data storage using XLSX library.

## Features

- **Google Authentication** - Sign in with Google via Firebase
- **Excel Data Storage** - Store blog posts in .xlsx format using XLSX library
- **Protected Routes** - Create/Edit posts only for authenticated users
- **Responsive Design** - Clean, modern UI with responsive layout
- **Navigation** - Home, Posts, About, Contact pages
- **Loading States** - Proper loading and error handling

## Prerequisites

Before running this application, you need:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** or **yarn** package manager

## Setup Instructions

### 1. Install Dependencies

Run the following command in your terminal:

```bash
npm install
```

This will install all required packages including:
- `react` & `react-dom` - Core React libraries
- `react-router-dom` - Routing
- `firebase` - Authentication service
- `xlsx` - Excel file handling

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** → **Sign-in method** → **Google**
4. Get your Firebase configuration:
   - Click your project settings (⚙️ icon)
   - Scroll down to "Your apps" section
   - Click "Web app" (</>) or view existing config
5. Replace the placeholder values in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Create Excel File for Blog Posts

The application uses an Excel file for blog post storage. Follow these steps:

#### Manual Setup (Recommended):

1. Install Excel or LibreOffice
2. Create a new Excel workbook
3. Add the following headers in row 1:
   - `id`, `title`, `content`, `author`, `timestamp`, `status`
4. Save as `blog_posts.xlsx` in your project root directory

#### Auto-creation (Alternative):

You can programmatically create the Excel file using Node.js:

```javascript
const XLSX = require('xlsx');
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet([
  ['id', 'title', 'content', 'author', 'timestamp', 'status'],
  [] // Add sample data here
]);
XLSX.utils.book_append_sheet(workbook, worksheet, 'BlogPosts');
XLSX.writeFile(workbook, 'blog_posts.xlsx');
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or a different port if 5173 is in use).

## Project Structure

```
ollama-sample-qwen3.59b-react-blog/
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── index.html                # Entry HTML file
└── src/
    ├── App.jsx               # Main app with routing
    ├── main.jsx              # React root
    ├── index.css             # Global styles
    ├── firebase/
    │   └── config.js         # Firebase authentication setup
    ├── hooks/
    │   └── useAuth.js        # Authentication hook
    ├── utils/
    │   └── excelService.js   # Excel file operations
    ├── components/
    │   ├── Navbar.jsx        # Navigation bar
    │   ├── BlogPostCard.jsx  # Individual post card component
    │   └── PostList.jsx      # List of blog posts
    └── pages/
        ├── Home.jsx          # Home page
        ├── Login.jsx         # Login page
        ├── Profile.jsx       # User profile page
        ├── PostList.jsx     # Posts list page
        ├── PostDetail.jsx   # Individual post detail
        ├── CreatePost.jsx   # Create new post
        └── EditPost.jsx     # Edit existing post
