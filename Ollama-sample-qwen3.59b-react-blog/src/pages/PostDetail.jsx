import { useParams, useNavigate } from 'react-router-dom'
import BlogPostCard from '../components/BlogPostCard'
import Navbar from '../components/Navbar'
import { readBlogPosts } from '../utils/excelService'
import { useState } from 'react'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await readBlogPosts()
        const post = data.find(p => p.id === parseInt(id))
        setPosts(post || [])
        setLoading(false)
      } catch (err) {
        setError('Failed to load blog post')
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 max-w-md mx-auto rounded-r-lg ml-4">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  const post = posts[0] || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/posts"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Posts
        </Link>

        {/* Post content */}
        <article className="bg-white rounded-xl shadow-md p-8">
          {post.title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                <span>•</span>
                <span>by {post.author || 'Anonymous'}</span>
              </div>
            </div>
          )}

          {post.content ? (
            <div className="prose max-w-none prose-indigo">
              <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <p className="text-gray-400 italic">No content available for this post.</p>
          )}

          {/* Post metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
            <span>Status: {post.status || 'draft'}</span>
            <Link
              to={`/edit/${post.id}`}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Edit this post →
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © 2024 React Blog
        </div>
      </footer>
    </div>
  )
}

export default PostDetail
