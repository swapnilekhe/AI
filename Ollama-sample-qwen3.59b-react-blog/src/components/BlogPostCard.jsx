import { Link } from 'react-router-dom'

const BlogPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
            {post.status}
          </span>
          <Link
            to={`/post/${post.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Read more →
          </Link>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {post.title || 'Untitled Post'}
        </h2>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {post.content || 'No content available.'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <span>{formatDate(post.timestamp)}</span>
          <span>by {post.author || 'Anonymous'}</span>
        </div>
      </div>
    </div>
  )
}

export default BlogPostCard
