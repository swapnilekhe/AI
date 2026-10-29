import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // Check if already authenticated on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (isAuthenticated) {
      navigate('/')
    }
  }, [navigate])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      
      // Store auth state in localStorage for demo purposes
      // In production, you'd store the actual Firebase user ID or custom claims
      const token = 'google_auth_token_' + Date.now()
      localStorage.setItem('auth_token', token)
      localStorage.setItem('isAuthenticated', 'true')
      
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('isAuthenticated')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          📝 Blog Login
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
          >
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.71-.96 7.88-2.66h-3.57v-2.77c-.66.34-1.39.55-2.19.59V23z" />
                  <path fill="#FBBC05" d="M12 23c-2.97 0-5.71-.96-7.88-2.66h3.57v-2.77c1.38-.06 2.74-.53 3.84-1.33V4.5H12z" />
                  <path fill="#EA4335" d="M4.94 12.25h3.5c.56-2.97.24-6-1.79-8.2l-1.71 1.67a9.02 9.02 0 003.09 4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {localStorage.getItem('isAuthenticated') === 'true' && (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              👋 Welcome! Please use Google to sign in and create your blog posts.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t">
            <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
