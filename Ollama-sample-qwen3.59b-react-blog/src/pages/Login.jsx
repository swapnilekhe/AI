import { Link, useNavigate } from 'react-router-dom'
import { app, auth, provider } from '../firebase/config'
import { signInWithPopup } from 'firebase/auth'
import { useState } from 'react'

const Login = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider)
      // Redirect to home after successful login
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err.message || 'Failed to sign in with Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back!
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.65z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.49 3.09 15.05 2 12 2 7.7 2 3.99 4.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in with Google</h2>
            <p className="text-gray-500 text-sm">
              Continue as a guest, or sign in to create and manage blog posts.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

          <div className="text-gray-400 text-sm mt-2">or</div>

          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse as guest →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
