import React, { useState, useEffect } from 'react'
import { readBlogPosts } from '../utils/excelService'

const PostList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await readBlogPosts()
        setPosts(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
        setLoading(false)
      } catch (err) {
        setError('Failed to load blog posts')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md mx-auto rounded-r-lg">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 max-w-md mx-auto rounded-r-lg">
        <h3 className="font-semibold text-gray-800 mb-2">No blog posts found</h3>
        <p className="text-gray-600 text-sm">
          Get started by creating your first blog post.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default PostList
