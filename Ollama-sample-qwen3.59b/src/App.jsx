import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import EditPost from './pages/EditPost'
import About from './pages/About'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Simple layout component with navigation
function Layout({ children, title }) {
  const [currentPage, setCurrentPage] = useState('')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2 group">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all">
                📝 EWBlog
              </span>
            </a>
            
            <div className="hidden md:flex space-x-1">
              <a href="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === '' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                Home
              </a>
              <a href="/about" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === '/about' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                About
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <a href="/create-post" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === '/create-post' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                    ✏️ New Post
                  </a>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('auth_token')
                      window.location.reload()
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all"
                  >
                    🚪 Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with modern gradient background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2024 EWBlog - A modern blog platform</p>
            <p className="mt-1">Built with React and SQL Server</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  // Track current page for navigation highlighting
  useEffect(() => {
    const path = window.location.pathname
    setCurrentPage(path)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout title="Home">
            <Home />
          </Layout>
        } />
        <Route path="/about" element={
          <Layout title="About">
            <About />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout title="Login">
            <Login />
          </Layout>
        } />
        <Route 
          path="/create-post" 
          element={
            <Layout title="Create New Post">
              <ProtectedRoute children={<CreatePost />} />
            </Layout>
          } 
        />
        <Route 
          path="/post/:id" 
          element={
            <Layout title="Blog Post">
              <ProtectedRoute children={<PostDetail />} />
            </Layout>
          } 
        />
        <Route 
          path="/edit-post/:id" 
          element={
            <Layout title="Edit Post">
              <ProtectedRoute children={<EditPost />} />
            </Layout>
          } 
        />
        <Route path="*" element={
          <Layout title="404 - Not Found">
            <NotFound />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
