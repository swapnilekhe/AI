import express from 'express';
import mssql from 'mssql';

const app = express();
const PORT = process.env.PORT || 5173;

// Simple CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Environment configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'EWBlog',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Enable column naming convention for easier mapping
    columnEncryption: false
  }
};

// Initialize MS SQL connection pool once when app starts
let dbPool = null;

async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    dbPool = await mssql.connect(config);
    console.log('✓ Database connection established successfully!');
    
    // Test connection by querying a sample post
    const result = await dbPool.request().query('SELECT TOP 5 * FROM Posts WHERE Status = \'published\' ORDER BY createdAt DESC');
    console.log(`✓ Found ${result.recordCount} published posts`);
    
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    console.log('Note: This is expected if DB_PASSWORD environment variable is not set.');
    process.exit(1);
  }
}

// Get all published posts for the homepage
app.get('/api/posts', async (req, res) => {
  try {
    const result = await dbPool.request().query(`
      SELECT 
        PostId,
        Title,
        SlUG as Slug,
        Excerpt,
        [Content] as Content,
        FeaturedImage,
        CategoryId,
        UserId,
        Status,
        IsFeatured,
        ReadTimeMinutes,
        ViewCount,
        LikeCount,
        createdAt,
        updatedAt,
        publishedAt
      FROM Posts 
      WHERE Status = 'published'
      ORDER BY createdAt DESC
    `);
    
    if (result.recordCount === 0) {
      // Return sample posts if database has no data yet
      const samplePosts = generateSamplePosts();
      return res.json(samplePosts);
    }
    
    res.json(result.recordset.map(post => ({
      id: post.PostId,
      title: post.Title,
      slug: post.Slug,
      excerpt: post.Excerpt || 'No excerpt available',
      content: post.Content || '',
      featuredImage: post.FeaturedImage,
      categoryId: post.CategoryId,
      userId: post.UserId,
      status: post.Status,
      isFeatured: post.IsFeatured,
      readTimeMinutes: post.ReadTimeMinutes,
      viewCount: post.ViewCount,
      likeCount: post.LikeCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    })));
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts', message: err.message });
  }
});

// Get a single post by ID or slug
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Try to find by numeric ID first
    let result = await dbPool.request().query('SELECT * FROM Posts WHERE PostId = ?', [id]);
    
    if (result.recordCount === 0) {
      // If not found by ID, try slug
      result = await dbPool.request().query('SELECT * FROM Posts WHERE Slug = LOWER(?)', [id.toLowerCase()]);
    }
    
    if (result.recordCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = result.recordset[0];
    res.json({
      id: post.PostId,
      title: post.Title,
      slug: post.Slug,
      excerpt: post.Excerpt || '',
      content: post.Content || '',
      featuredImage: post.FeaturedImage,
      categoryId: post.CategoryId,
      userId: post.UserId,
      status: post.Status,
      isFeatured: post.IsFeatured,
      readTimeMinutes: post.ReadTimeMinutes,
      viewCount: post.ViewCount,
      likeCount: post.LikeCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    });
  } catch (err) {
    console.error('Error fetching post:', err.message);
    res.status(500).json({ error: 'Failed to fetch post', message: err.message });
  }
});

// Generate sample posts for development/testing when database is empty
function generateSamplePosts() {
  return [
    {
      id: 1,
      title: 'Introduction to Artificial Intelligence',
      slug: 'introduction-to-ai',
      excerpt: 'Explore the fascinating world of AI, its applications in modern technology, and how it\'s transforming industries across the globe.',
      content: `# Introduction to Artificial Intelligence

Artificial Intelligence (AI) is revolutionizing how we live and work. From smart assistants to autonomous vehicles, AI is everywhere.

In this article, we'll explore:
- What is AI?
- Types of AI systems
- Real-world applications
- Future trends`,
      featuredImage: null,
      categoryId: 1,
      userId: 1,
      status: 'published',
      isFeatured: true,
      readTimeMinutes: 8,
      viewCount: 1250,
      likeCount: 87,
      createdAt: new Date('2024-01-15T10:00:00Z').toISOString()
    },
    {
      id: 2,
      title: 'Understanding Neural Networks',
      slug: 'understanding-neural-networks',
      excerpt: 'Deep dive into neural networks, their architecture, and how they enable machines to learn from data and make intelligent decisions.',
      content: `# Understanding Neural Networks

Neural networks are the foundation of modern AI systems. Let's break down how they work:

## Architecture
- Input layers
- Hidden layers
- Output layers
- Activation functions`,
      featuredImage: null,
      categoryId: 2,
      userId: 2,
      status: 'published',
      isFeatured: false,
      readTimeMinutes: 12,
      viewCount: 980,
      likeCount: 65,
      createdAt: new Date('2024-01-20T14:30:00Z').toISOString()
    },
    {
      id: 3,
      title: 'Generative AI: The Future of Creation',
      slug: 'generative-ai-future',
      excerpt: 'Discover how generative AI models are revolutionizing content creation, from text generation to image synthesis and beyond.',
      content: `# Generative AI: The Future of Creation

Generative AI has opened new frontiers in creative work. Learn about:
- Text-to-image models
- Natural language generation
- Video synthesis
- Music composition`,
      featuredImage: null,
      categoryId: 2,
      userId: 3,
      status: 'published',
      isFeatured: true,
      readTimeMinutes: 10,
      viewCount: 1540,
      likeCount: 112,
      createdAt: new Date('2024-01-25T09:15:00Z').toISOString()
    },
    {
      id: 4,
      title: 'Ethical Considerations in AI Development',
      slug: 'ai-ethics-development',
      excerpt: 'Examining the moral implications of AI systems, bias mitigation, and responsible artificial intelligence practices.',
      content: `# Ethical AI Development

As AI becomes more powerful, ethical considerations become crucial. We'll discuss:
- Algorithmic fairness
- Privacy concerns
- Transparency requirements
- Accountability measures`,
      featuredImage: null,
      categoryId: 2,
      userId: 1,
      status: 'published',
      isFeatured: false,
      readTimeMinutes: 15,
      viewCount: 890,
      likeCount: 73,
      createdAt: new Date('2024-02-01T11:00:00Z').toISOString()
    },
    {
      id: 5,
      title: 'Language Models: Understanding Qwen and Beyond',
      slug: 'language-models-qwen',
      excerpt: 'How large language models like Qwen 3.5 work, their architecture, training methods, and applications in real-world scenarios.',
      content: `# Language Models Explained

Large Language Models (LLMs) have transformed NLP. This guide covers:
- Transformer architecture
- Pre-training strategies
- Fine-tuning techniques
- Application examples`,
      featuredImage: null,
      categoryId: 2,
      userId: 2,
      status: 'published',
      isFeatured: true,
      readTimeMinutes: 18,
      viewCount: 1320,
      likeCount: 95,
      createdAt: new Date('2024-02-05T16:45:00Z').toISOString()
    },
    {
      id: 6,
      title: 'Modern Web Development with React and Vite',
      slug: 'react-vite-development',
      excerpt: 'Learn about building modern web applications using React, TypeScript, and Vite for fast development and optimized builds.',
      content: `# Modern Web Development

React + TypeScript + Vite is a powerful stack. Discover:
- Component composition
- State management
- Build optimization
- Deployment strategies`,
      featuredImage: null,
      categoryId: 3,
      userId: 1,
      status: 'published',
      isFeatured: false,
      readTimeMinutes: 20,
      viewCount: 760,
      likeCount: 58,
      createdAt: new Date('2024-02-10T13:20:00Z').toISOString()
    },
    {
      id: 7,
      title: 'Getting Started with Machine Learning',
      slug: 'getting-started-machine-learning',
      excerpt: 'A beginner\'s guide to machine learning concepts, tools, and resources. Perfect for those just starting their ML journey.',
      content: `# Getting Started with ML

Machine learning is accessible! Here's what you need to know:
- Prerequisites
- Popular frameworks
- First project ideas
- Learning resources`,
      featuredImage: null,
      categoryId: 2,
      userId: 3,
      status: 'published',
      isFeatured: true,
      readTimeMinutes: 25,
      viewCount: 1100,
      likeCount: 89,
      createdAt: new Date('2024-02-15T10:30:00Z').toISOString()
    },
    {
      id: 8,
      title: 'Building REST APIs with MS SQL Server',
      slug: 'building-rest-apis-sql',
      excerpt: 'Step-by-step tutorial on creating robust REST APIs using Microsoft SQL Server with proper authentication and data validation.',
      content: `# Building REST APIs with SQL Server

Learn to create professional APIs:
- Endpoint design
- Data validation
- Authentication
- Error handling`,
      featuredImage: null,
      categoryId: 3,
      userId: 1,
      status: 'published',
      isFeatured: false,
      readTimeMinutes: 22,
      viewCount: 650,
      likeCount: 47,
      createdAt: new Date('2024-02-20T15:00:00Z').toISOString()
    },
    {
      id: 9,
      title: 'Implementing OAuth 2.0 with Google Authentication',
      slug: 'oauth-google-authentication',
      excerpt: 'Complete guide to implementing secure user authentication using OAuth 2.0, OpenID Connect, and Google\'s identity platform.',
      content: `# OAuth 2.0 Implementation

Secure authentication is critical. This guide covers:
- OAuth flow basics
- Google Identity Platform setup
- Token management
- Session handling`,
      featuredImage: null,
      categoryId: 3,
      userId: 2,
      status: 'published',
      isFeatured: true,
      readTimeMinutes: 16,
      viewCount: 920,
      likeCount: 78,
      createdAt: new Date('2024-02-25T09:45:00Z').toISOString()
    },
    {
      id: 10,
      title: 'Building Scalable Web Applications with React and Firebase',
      slug: 'react-firebase-scalable-apps',
      excerpt: 'Learn how to build production-ready web applications using React\'s modern hooks, state management, and Firebase for backend services.',
      content: `# Building with React & Firebase

Firebase provides excellent backend capabilities. Learn:
- Firestore database
- Authentication
- Hosting deployment
- Cloud functions`,
      featuredImage: null,
      categoryId: 3,
      userId: 3,
      status: 'published',
      isFeatured: false,
      readTimeMinutes: 28,
      viewCount: 540,
      likeCount: 42,
      createdAt: new Date('2024-03-01T12:00:00Z').toISOString()
    }
  ];
}

// Start the server
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║         EWBlog API Server             ║
╠══════════════════════════════════════╣
║  Port:     ${PORT}                   ║
║  Posts API: http://localhost:${PORT}/api/posts ║
║  Single Post: http://localhost:${PORT}/api/posts/:id ║
╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  dbPool.close().then(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  dbPool.close().then(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

export default app;