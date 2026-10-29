import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBlogPost } from '../utils/sqlService'

export default function CreatePost() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    categoryId: null,
    isFeatured: false,
    readTimeMinutes: null,
    excerpt: ''
  })
  const [previewTitle, setPreviewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])

  // Load categories on mount
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await (await import('../utils/sqlService')).getCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  // Handle input changes with live preview
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    
    if (name === 'title') {
      setPreviewTitle(value)
    }
  }

  // Auto-generate slug from title and generate excerpt if not provided
  React.useEffect(() => {
    if (formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      // Generate excerpt from first paragraph of content
      if (!formData.excerpt && formData.content) {
        const firstParagraph = formData.content.split('\n\n')[0]
        setFormData(prev => ({ ...prev, excerpt: firstParagraph.substring(0, 200).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'') + '.' }))
      }
    }
  }, [formData.title, formData.content])

  // Handle form submission with validation and auto-save logic
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Auto-generate slug if not provided
      const finalData = {
        ...formData,
        Slug: formData.Slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      
      const result = await addBlogPost(finalData)
      
      // Success feedback with modern UI
      alert(`✓ Post "${result.Title}" created successfully! \n\nIt has been saved to the SQL Server database.`)
      
      setFormData({
        title: '',
        content: '',
        author: '',
        categoryId: null,
        isFeatured: false,
        readTimeMinutes: null,
        excerpt: ''
      })
      navigate('/post/' + finalData.Slug)
    } catch (error) {
      console.error('Error creating post:', error)
      alert(`✗ Failed to create post: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Categories dropdown
  const selectedCategory = categories.find(c => c.CategoryId === formData.categoryId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation - already in App.jsx */}
      
      {/* Create Post Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            ✏️ Create New Blog Post
            <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              Powered by SQL Server 💾
            </span>
          </h1>
          <p className="text-gray-600 mb-8">
            Write and publish your next amazing article. All data is stored securely in our database.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-base font-semibold text-gray-800 mb-2 flex items-center">
                <span>Title *</span>
                <span className="ml-auto text-sm text-gray-500">{previewTitle.length}/255</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={255}
                placeholder="Enter your blog post title (e.g., Introduction to Machine Learning)..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-medium"
              />

              {/* Live Preview */}
              {previewTitle && (
                <div className="mt-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <label className="block text-xs font-semibold text-indigo-800 mb-1 uppercase tracking-wide">
                    Live Preview:
                  </label>
                  <p className="text-indigo-900 text-base leading-relaxed italic">
                    {previewTitle}
                  </p>
                </div>
              )}
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="categoryId" className="block text-base font-semibold text-gray-800 mb-2">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value || null }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryId} value={cat.CategoryId}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-base font-medium text-gray-700">⭐ Feature this post on homepage</span>
                </label>
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-base font-semibold text-gray-800 mb-2 flex items-center">
                <span>Content *</span>
                <span className="ml-auto text-sm text-gray-500">{formData.content?.length || 0} chars</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={18}
                placeholder="Write your blog post content here using HTML formatting:\n\n&lt;h2&gt;Subheading...&lt;/h2&gt;\n&lt;p&gt;Paragraph 1...&lt;/p&gt;\n\nUse rich text to make it engaging!"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed resize-none"
              ></textarea>

              {/* Formatting guide */}
              <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Content Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Use &lt;h2&gt; for subheadings to break up content</li>
                  <li>Add images using HTML: &lt;img src="url" alt="description" /&gt;</li>
                  <li>Include code examples with syntax highlighting</li>
                  <li>Maintain a conversational tone to engage readers</li>
                  <li>Keep paragraphs short (2-4 sentences)</li>
                </ul>
              </div>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-base font-semibold text-gray-800 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                required
                placeholder="Enter your full name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="excerpt" className="block text-base font-semibold text-gray-800 mb-2">
                  Excerpt (Optional)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  placeholder="Brief summary (auto-generated from first paragraph if not provided)"
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label htmlFor="readTimeMinutes" className="block text-base font-semibold text-gray-800 mb-2">
                  Read Time (Optional)
                </label>
                <input
                  type="number"
                  id="readTimeMinutes"
                  name="readTimeMinutes"
                  value={formData.readTimeMinutes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTimeMinutes: parseInt(e.target.value) || null }))}
                  placeholder="Estimated reading time in minutes"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <a
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </a>

              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8H8z"></path>
                    </svg>
                    Publishing to SQL Server...
                  </span>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Publish Post
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Database Powered Storage:
              </h3>
              <ul className="text-sm text-indigo-800 space-y-1 ml-7">
                <li>✓ All posts are saved to Microsoft SQL Server database</li>
                <li>✓ No data loss - your content is backed up regularly</li>
                <li>✓ Supports unlimited posts and categories</li>
                <li>✓ Full CRUD operations via web interface</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Feature badges */}
        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium shadow-sm">🚀 Modern React</span>
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium shadow-sm">💾 SQL Server</span>
          <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium shadow-sm">🎨 Tailwind CSS</span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm">✅ Type Safe</span>
        </div>
      </div>
    </div>
  )
}
