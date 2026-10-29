import { Outlet, Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            ReactBlog
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium ${
                location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              } transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/posts"
              className={`text-sm font-medium ${
                location.pathname === '/posts' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              } transition-colors`}
            >
              Posts
            </Link>
          </div>

          {/* About and Contact */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
