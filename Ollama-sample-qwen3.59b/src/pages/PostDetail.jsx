import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBlogPostById } from '../utils/excelService'
import { deleteBlogPost } from '../utils/excelService'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const fetchedPost = await getBlogPostById(id)
        setPost(fetchedPost)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [id])

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteBlogPost(id)
      alert('Post deleted successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post.')
    } finally {
      setShowDelete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-gray-700 mb-4">Post not found</h1>
          <a href="/" className="text-indigo-600 hover:text-indigo-800">Go Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-indigo-600">📝 My Blog</a>
            <a
              href="/create-post"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              New Post
            </a>
          </div>
        </div>
      </nav>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Post Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{post.Title || post.title}</h1>
            
            {showDelete ? (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
            ) : (
              <div className="flex gap-2">
                <a href={`/edit-post/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" role="link">Edit</a>
                
                <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm" type="button">Delete</button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-gray-500 text-sm mt-4">
            <span>By: {post.Author || post.author}</span>
            <span>•</span>
            <span>{new Date(post['Created At'] || Date.now()).toLocaleDateString()}</span>
            <span className="text-indigo-600 font-medium">{post.Status || 'Published'}</span>
          </div>
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="bg-white rounded-lg shadow-sm p-8 min-h-[500px] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: (post.Content || post.content) }}
          />
        </div>

        {/* Post Footer */}
        <footer className="mt-12 pt-8 border-t">
          <p className="text-center text-gray-500 text-sm">
            This blog post is stored in an Excel file for data persistence.
          </p>
        </footer>
      </article>

      {/* Related Posts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Placeholder for related posts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-center py-8">
              No other posts available in this demo. Create more posts to see related content!
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">💡 Tip</h3>
            <p className="text-gray-600">
              Create more blog posts by navigating to the "New Post" page and sharing your ideas with readers!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
