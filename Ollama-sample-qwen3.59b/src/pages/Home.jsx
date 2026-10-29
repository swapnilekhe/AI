import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">📝 My Blog</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <a href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                  <a href="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    About
                  </a>
                </>
              ) : (
                <>
                  <a href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                  <a href="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    About
                  </a>
                  <a href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Login
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to My Blog! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover interesting articles, tech insights, and creative content. 
            Join us and start writing your own posts!
          </p>
        </div>

        {/* Call to Action */}
        {isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Ready to Create?
            </h2>
            <p className="text-gray-600 mb-6">
              You're logged in! Why not write your first blog post?
            </p>
            <a
              href="/create-post"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Write New Post
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Get Started!
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to start writing, editing, and managing your blog posts.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign In with Google
              <svg className="ml-2 w-5 h-5" fill="#4285F4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.71-.96 7.88-2.66h-3.57v-2.77c-.66.34-1.39.55-2.19.59V23z" />
                  <path fill="#FBBC05" d="M12 23c-2.97 0-5.71-.96-7.88-2.66h3.57v-2.77c1.38-.06 2.74-.53 3.84-1.33V4.5H12z" />
                  <path fill="#EA4335" d="M4.94 12.25h3.5c.56-2.97.24-6-1.79-8.2l-1.71 1.67a9.02 9.02 0 003.09 4.53z" />
                </svg>
            </a>
          </div>
        )}

        {/* Sample Blog Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Featured Articles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Sample Post 1 - AI & Technology */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-6xl">🤖</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">AI & Technology</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Introduction to Artificial Intelligence</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  Explore the fascinating world of AI, its applications in modern technology, 
                  and how it's transforming industries across the globe.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Dr. Sarah Chen</span>
                  <span>• 8 min read</span>
                </div>
              </div>
            </div>

            {/* Sample Post 2 - Machine Learning */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <span className="text-6xl">🧠</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Machine Learning</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Understanding Neural Networks</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  Deep dive into neural networks, their architecture, and how they enable 
                  machines to learn from data and make intelligent decisions.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Alex Martinez</span>
                  <span>• 12 min read</span>
                </div>
              </div>
            </div>

            {/* Sample Post 3 - AI Applications */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-6xl">🔮</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-orange-600 font-semibold uppercase tracking-wide">AI Applications</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Generative AI: The Future of Creation</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  Discover how generative AI models are revolutionizing content creation, 
                  from text generation to image synthesis and beyond.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Emily Wu</span>
                  <span>• 10 min read</span>
                </div>
              </div>
            </div>

            {/* Sample Post 4 - AI Ethics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-6xl">⚖️</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">AI Ethics</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Ethical Considerations in AI Development</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  Examining the moral implications of AI systems, bias mitigation, 
                  and responsible artificial intelligence practices.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Professor James Kim</span>
                  <span>• 15 min read</span>
                </div>
              </div>
            </div>

            {/* Sample Post 5 - NLP */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">💬</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">NLP & LLMs</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Language Models: Understanding Qwen and Beyond</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  How large language models like Qwen 3.5 work, their architecture, 
                  training methods, and applications in real-world scenarios.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Research Team</span>
                  <span>• 18 min read</span>
                </div>
              </div>
            </div>

            {/* Sample Post 6 - AI Tools */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">🛠️</span>
              </div>
              <div className="p-6">
                <span className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">AI Tools</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3">Essential AI Tools for Developers</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  A curated list of must-have AI-powered tools that can boost your 
                  development workflow and productivity.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By Dev Team</span>
                  <span>• 7 min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 My Blog. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
