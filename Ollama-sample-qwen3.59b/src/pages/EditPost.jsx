import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBlogPostById, updateBlogPost, deleteBlogPost, getCategories } from '../utils/sqlService'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    categoryId: null,
    isFeatured: false,
    readTimeMinutes: null,
    excerpt: '',
    status: 'draft',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Fetch post and populate form on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [posts, fetchedPost] = await Promise.all([getCategories(), getBlogPostById(id)])
        
        if (fetchedPost && (!id.startsWith('draft-'))) {
          setPost(fetchedPost)
          setFormData({
            title: fetchedPost['Title'] || fetchedPost.title || '',
            content: fetchedPost['Content'] || fetchedPost.content || '',
            author: fetchedPost['AuthorName'] || fetchedPost.author || '',
            categoryId: fetchedPost.CategoryId || null,
            isFeatured: fetchedPost.IsFeatured === 1,
            readTimeMinutes: fetchedPost.ReadTimeMinutes || null,
            excerpt: fetchedPost.Excerpt || '',
            status: fetchedPost.Status,
          })
          setCategories(posts)
        } else {
          setError('Post not found or you do not have permission to edit it.')
        }
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post data: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) loadData()
  }, [id])

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Save post updates - enhanced with validation and auto-generate slug from title
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate at least title or content exists
    if (!formData.title && !formData.content) {
      alert('⚠️ Please enter a title or content before saving.')
      return
    }
    
    setSaving(true)

    try {
      // Generate slug from title if not provided
      const slug = formData.Slug || (formData.title ? 
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id)
      
      const payload = {
        ...formData,
        Slug: slug,
        PostId: parseInt(id.replace('draft-', '')) || undefined // SQL doesn't allow auto-increment in update, must specify ID
      }
      
      await updateBlogPost(id, payload)
      
      alert(`✓ Post "${payload.Title || 'Untitled'}" updated successfully!\n\nSaved to SQL Server database.`)
      navigate('/post/' + slug)
    } catch (error) {
      console.error('Error updating post:', error)
      alert('✗ Failed to update post: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete draft posts only - with enhanced UX
  const handleDelete = async () => {
    if (post?.Status !== 'draft') {
      alert('⚠️ Only draft posts can be deleted! Please create a new post instead.')
      return
    }
    
    if (!confirm('⚠️ Are you sure you want to delete this post?\n\nThis action cannot be undone!')) return
    
    try {
      await deleteBlogPost(id)
      alert('✓ Post deleted successfully!\n\nRedirecting to home...')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('✗ Failed to delete post: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl text-gray-700 mb-4">Post not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This post could not be located.'}</p>
          <a href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            🏠 Go Home
          </a>
        </div>
      </div>
    )
  }

  // Get selected category name for display
  const selectedCategory = categories.find(c => c.CategoryId === formData.categoryId)

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

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter post title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={15}
                placeholder="Edit your blog post content..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              ></textarea>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Enter your name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <a
                href={`/post/${id}`}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                View Post
              </a>

              <a
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </a>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">ℹ️ Editing:</h3>
          <p className="text-sm text-blue-800">
            Changes will be saved to the Excel file. Make sure to click "Save Changes" when done.
          </p>
        </div>
      </div>
    </div>
  )
}
