import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

const Profile = () => {
  const { user, loading, logOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-6 text-center">
            {user ? (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">User Profile</h1>
                <p className="text-gray-500">{user.email}</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No User Logged In</h1>
                <p className="text-gray-500">You need to sign in to view your profile.</p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {user ? (
              <>
                {/* User Info Card */}
                <section className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    {user.photoURL && (
                      <>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Photo:</span>
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <section className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={logOut}
                    className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Sign Out
                  </button>
                </section>
              </>
            ) : (
              <>
                {/* Sign In Card */}
                <section className="bg-indigo-50 rounded-lg p-6 text-center">
                  <h2 className="text-lg font-semibold text-indigo-900 mb-3">Sign In to View Profile</h2>
                  <p className="text-indigo-700 mb-6 max-w-md mx-auto">
                    Sign in with Google to see your personalized profile and manage your account.
                  </p>

                  {/* Sign In Button */}
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-8 py-3 bg-white border-2 border-indigo-500 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.65z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.49 3.09 15.05 2 12 2 7.7 2 3.99 4.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign In with Google
                  </Link>
                </section>

                {/* Guest Features */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Access</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <svg className="w-6 h-6 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">Browse all blog posts</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <svg className="w-6 h-6 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-gray-700">Read blog posts anonymously</p>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © 2024 React Blog
        </div>
      </footer>
    </div>
  )
}

export default Profile
