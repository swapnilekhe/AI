import React from 'react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-indigo-600">📝 My Blog</span>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="/about" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                About
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* About Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About This Blog</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">📖 About the Project</h2>
              <p className="mb-4">
                Welcome to our React blog application! This is a modern, responsive blog platform built with React, 
                designed for creating, managing, and sharing blog posts with ease.
              </p>
              <p>
                The blog features Google authentication, Excel-based data storage, and a clean user interface that 
                makes content creation enjoyable and efficient.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">⚛️ Technology Stack</h2>
              <ul className="space-y-2 ml-4 list-disc">
                <li><strong>React</strong> - Frontend framework for a dynamic user experience</li>
                <li><strong>Vite</strong> - Fast build tool and development server</li>
                <li><strong>React Router</strong> - Client-side routing for seamless navigation</li>
                <li><strong>Firebase</strong> - Authentication (Google Sign-In)</li>
                <li><strong>XLSX</strong> - Excel file manipulation for data storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">✨ Features</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">🔐 Google Authentication</h3>
                  <p className="text-sm">
                    Secure login using Google accounts with Firebase integration.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">📊 Excel Data Storage</h3>
                  <p className="text-sm">
                    Blog posts are stored in an Excel file (.xlsx) for persistent data.
                  </p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-pink-900 mb-2">📝 Rich Content Editor</h3>
                  <p className="text-sm">
                    Create and format beautiful blog posts with a simple textarea.
                  </p>
                </div>
                
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-semibold text-teal-900 mb-2">🔄 Edit & Delete</h3>
                  <p className="text-sm">
                    Full CRUD operations with update and delete functionality.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">📋 Blog Structure</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Field</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-left py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-mono text-sm">Post ID</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Unique identifier for each post</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-mono text-sm">Title</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Post title (max 200 chars)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-mono text-sm">Content</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Full post content/HTML</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-mono text-sm">Author</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Author name</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-mono text-sm">Created At</td>
                      <td className="py-2 px-3">Date</td>
                      <td className="py-2 px-3">Post creation timestamp</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-sm">Status</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Draft/Published/Archived</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">🚀 Getting Started</h2>
              <div className="space-y-4 mt-4">
                <ol className="list-decimal ml-4 space-y-2">
                  <li>
                    <strong>Install Dependencies:</strong> Run <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm install</code>
                  </li>
                  <li>
                    <strong>Configure Firebase:</strong> Update the Firebase configuration in <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/firebaseConfig.js</code> with your own Firebase project credentials from the Firebase Console.
                  </li>
                  <li>
                    <strong>Sign In:</strong> Use Google Sign-In to access the blog features.
                  </li>
                  <li>
                    <strong>Create Posts:</strong> Navigate to create a new blog post and start writing!
                  </li>
                  <li>
                    <strong>Manage Content:</strong> Edit or delete your posts anytime.
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">📁 File Structure</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`src/
├── App.jsx                    # Main app with routing
├── firebaseConfig.js          # Firebase configuration
├── context/
│   └── AuthContext.jsx        # Authentication state management
├── pages/
│   ├── Home.jsx               # Homepage
│   ├── Login.jsx              # Google login page
│   ├── CreatePost.jsx         # Create new post
│   ├── PostDetail.jsx         # View individual post
│   ├── EditPost.jsx           # Edit existing post
│   └── About.jsx              # About page
├── utils/
│   └── excelService.js        # Excel data operations
└── components/                # Reusable components
`}
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-3">📝 License</h2>
              <p className="ml-4 p-4 bg-green-50 rounded-lg">
                This project is open source and available for educational purposes. Feel free to modify 
                and customize it for your own projects!
              </p>
            </section>

            <footer className="pt-6 border-t mt-8">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>© 2024 My Blog. Built with ❤️ using React & Firebase</span>
                <span>Data stored in: blog_posts.xlsx</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
