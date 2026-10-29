import { Link } from 'react-router-dom'
import BlogPostCard from '../components/BlogPostCard'
import Navbar from '../components/Navbar'
import PostList from './PostList'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, tutorials, and insights. 
            Browse through our collection of articles.
          </p>
        </div>

        <PostList />

        {/* Newsletter section */}
        <section className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Subscribe to our newsletter</h2>
          <p className="mb-4 max-w-xl mx-auto opacity-90">
            Get the latest blog posts and updates delivered straight to your inbox.
          </p>
          <form className="max-w-md mx-auto flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none text-gray-800"
            />
            <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-r-lg hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 React Blog. All rights reserved.
            </p>
            <nav className="flex space-x-6 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
