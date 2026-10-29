/**
 * SQL Server Database Service for EWBlog
 * Handles all database operations with modern async/await pattern
 */

import sql from 'mssql'

// Database configuration - can be updated based on environment
const dbConfig = {
  driver: 'odbc', // Using ODBC for Windows compatibility
  server: process.env.SQL_SERVER || '.', // Can be overridden via env var
  database: process.env.DB_NAME || 'EWBlog',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  connectionTimeout: 30000
}

/**
 * Initialize SQL pool connection
 */
async function getPool() {
  const masterPool = new sql.ConnectionPool(dbConfig)
  
  try {
    await masterPool.connect()
    
    // Check if EWBlog database exists, create if not
    const dbExistsCheck = await masterPool.request().query('SELECT name FROM sys.databases WHERE name = ?', ['EWBlog'])
    
    if (dbExistsCheck.recordset.length === 0) {
      console.log('Creating EWBlog database...')
      await masterPool.request().query('CREATE DATABASE EWBlog')
    }
    
    return new sql.ConnectionPool({
      ...dbConfig,
      database: dbConfig.database
    })
  } catch (error) {
    console.error('Failed to connect to SQL Server:', error.message)
    throw new Error('Database connection failed. Please ensure SQL Server is running.')
  }
}

/**
 * Initialize all required tables and insert sample data
 */
export async function initializeDatabase() {
  try {
    const pool = await getPool()
    
    // Create tables if they don't exist
    const createTablesSql = `
USE EWBlog;
GO

-- Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Users]') AND type IN (N'U'))
CREATE TABLE [Users] (
    [UserId] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL UNIQUE,
    [Email] NVARCHAR(255) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [Salt] NVARCHAR(128) NOT NULL,
    [DisplayName] NVARCHAR(100),
    [Bio] NVARCHAR(500),
    [AvatarUrl] NVARCHAR(500),
    [IsActive] BIT DEFAULT 1 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    [LastLoginAt] DATETIME2
)

-- Categories table  
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Categories]') AND type IN (N'U'))
CREATE TABLE [Categories] (
    [CategoryId] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(500),
    [IsActive] BIT DEFAULT 1 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
)

-- Posts table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Posts]') AND type IN (N'U'))
CREATE TABLE [Posts] (
    [PostId] INT IDENTITY(1,1) PRIMARY KEY,
    [Title] NVARCHAR(255) NOT NULL,
    [Slug] NVARCHAR(255) NOT NULL UNIQUE,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Excerpt] NVARCHAR(500),
    [FeaturedImage] NVARCHAR(500),
    [CategoryId] INT FOREIGN KEY REFERENCES [Categories]([CategoryId]),
    [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users]([UserId]),
    [Status] NVARCHAR(20) DEFAULT 'draft' NOT NULL,
    [IsFeatured] BIT DEFAULT 0 NOT NULL,
    [ReadTimeMinutes] INT,
    [ViewCount] INT DEFAULT 0 NOT NULL,
    [LikeCount] INT DEFAULT 0 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    [PublishedAt] DATETIME2
)

-- Tags table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Tags]') AND type IN (N'U'))
CREATE TABLE [Tags] (
    [TagId] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL UNIQUE
)

-- PostTags bridge table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PostTags]') AND type IN (N'U'))
CREATE TABLE [PostTags] (
    [PostTagId] INT IDENTITY(1,1) PRIMARY KEY,
    [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
    [TagId] INT NOT NULL FOREIGN KEY REFERENCES [Tags]([TagId])
)

-- Comments table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Comments]') AND type IN (N'U'))
CREATE TABLE [Comments] (
    [CommentId] INT IDENTITY(1,1) PRIMARY KEY,
    [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [AuthorName] NVARCHAR(100) NOT NULL,
    [AuthorEmail] NVARCHAR(255),
    [Content] NVARCHAR(MAX) NOT NULL,
    [Status] NVARCHAR(20) DEFAULT 'pending' NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
)

-- Likes table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Likes]') AND type IN (N'U'))
CREATE TABLE [Likes] (
    [LikeId] INT IDENTITY(1,1) PRIMARY KEY,
    [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
)

-- Sessions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Sessions]') AND type IN (N'U'))
CREATE TABLE [Sessions] (
    [SessionId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users]([UserId]),
    [Token] NVARCHAR(500) NOT NULL,
    [ExpireAt] DATETIME2 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
)

-- Create indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Posts]') AND name = 'IX_Posts_CategoryId')
CREATE NONCLUSTERED INDEX [IX_Posts_CategoryId] ON [Posts]([CategoryId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Posts]') AND name = 'IX_Posts_UserId')
CREATE NONCLUSTERED INDEX [IX_Posts_UserId] ON [Posts]([UserId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Comments]') AND name = 'IX_Comments_PostId')
CREATE NONCLUSTERED INDEX [IX_Comments_PostId] ON [Comments]([PostId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Likes]') AND name = 'IX_Likes_PostId')
CREATE NONCLUSTERED INDEX [IX_Likes_PostId] ON [Likes]([PostId]);

PRINT 'Tables created successfully!';
GO
    `
    
    await pool.request().query(createTablesSql)
    
    // Insert sample categories
    const categoriesSql = `
INSERT INTO Categories (Name, Slug, Description) VALUES
(N'Technology', N'technology', N'Latest tech news and trends'),
(N'AI & ML', N'ai-ml', N'Artificial Intelligence and Machine Learning insights'),
(N'Development', N'development', N'Software development tips and tutorials'),
(N'Tutorials', N'tutorials', N'Step-by-step guides for learning new skills')
    `
    await pool.request().query(categoriesSql)
    
    // Insert sample tags
    const tagsSql = `
INSERT INTO Tags (Name, Slug) VALUES
(N'Python', N'python'),
(N'JavaScript', N'javascript'),
(N'AI', N'ai'),
(N'Machine Learning', N'machine-learning'),
(N'Development', N'development'),
(N'Technology', N'technology')
    `
    await pool.request().query(tagsSql)
    
    // Insert sample users (with hashed passwords - use actual hash in production)
    const usersSql = `
INSERT INTO Users (Username, Email, PasswordHash, Salt, DisplayName, Bio) VALUES
(N'admin', N'admin@ewblog.local', N'$2b$10$hashed_password_placeholder_salt', N'salt_placeholder', N'Admin User', N'Site administrator'),
(N'john_doe', N'john@example.com', N'$2b$10$hashed_password_placeholder_salt', N'salt_placeholder', N'John Doe', N'Tech enthusiast'),
(N'sarah_smith', N'sarah@example.com', N'$2b$10$hashed_password_placeholder_salt', N'salt_placeholder', N'Sarah Smith', N'Developer and blogger')
    `
    await pool.request().query(usersSql)
    
    console.log('Database initialized successfully with sample data!')
    return true
    
  } catch (error) {
    console.error('Error initializing database:', error.message)
    throw error
  } finally {
    // Pool is closed automatically on disconnect, but let's be explicit
  }
}

/**
 * Read all blog posts from database
 */
export async function readBlogPosts() {
  try {
    const pool = await getPool()
    
    // Get active published posts ordered by date desc
    const request = pool.request()
      .input('OrderBy', sql.Text, 'CreatedAt DESC')
      .input('Limit', sql.Int, 20) // Limit to first 20 for home page
    
    const result = await request.query(`
        SELECT 
            p.PostId,
            p.Title,
            p.Slug,
            p.Content,
            p.Excerpt,
            p.FeaturedImage,
            p.Status,
            p.IsFeatured,
            p.ReadTimeMinutes,
            p.ViewCount,
            p.LikeCount,
            p.CreatedAt,
            p.UpdatedAt,
            u.DisplayName AS AuthorName,
            u.AvatarUrl
        FROM Posts p
        INNER JOIN Users u ON p.UserId = u.UserId
        WHERE p.Status = 'published'
        ORDER BY p.CreatedAt DESC
    `)
    
    return result.recordset
    
  } catch (error) {
    console.error('Error reading blog posts:', error.message)
    return []
  }
}

/**
 * Read all posts (including drafts and unpublished)
 */
export async function readAllPosts() {
  try {
    const pool = await getPool()
    
    const request = pool.request()
      .input('OrderBy', sql.Text, 'CreatedAt DESC')
      .input('Limit', sql.Int, 100) // Larger limit for admin
    
    const result = await request.query(`
        SELECT 
            p.PostId,
            p.Title,
            p.Slug,
            p.Content,
            p.Excerpt,
            p.FeaturedImage,
            p.CategoryId,
            p.UserId,
            p.Status,
            p.IsFeatured,
            p.ReadTimeMinutes,
            p.ViewCount,
            p.LikeCount,
            p.CreatedAt,
            p.UpdatedAt,
            u.DisplayName AS AuthorName,
            u.AvatarUrl,
            c.Name AS CategoryName
        FROM Posts p
        INNER JOIN Users u ON p.UserId = u.UserId
        LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
        ORDER BY p.CreatedAt DESC
    `)
    
    return result.recordset
    
  } catch (error) {
    console.error('Error reading all blog posts:', error.message)
    return []
  }
}

/**
 * Add a new blog post
 */
export async function addBlogPost(postData) {
  try {
    const pool = await getPool()
    
    // Generate unique slug from title if not provided
    let slug = postData.Slug || postData.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Check for duplicate slug and append number if needed
    let baseSlug = slug;
    let existingCount = 0;
    while (await hasPostWithSlug(pool, slug)) {
      existingCount++
      const parts = baseSlug.split('-')
      const allNumbered = parts.map((_, i) => i < parts.length - 1 ? parts[i] : `${parseInt(parts[parts.length - 1]) + existingCount}`)
      slug = allNumbered.join('-')
    }
    
    const request = pool.request()
      .input('Title', sql.NVarChar, postData.Title)
      .input('Slug', sql.NVarChar, slug)
      .input('Content', sql.NText, postData.Content)
      .input('Excerpt', sql.NVarChar, postData.Excerpt || null)
      .input('FeaturedImage', sql.NVarChar, postData.FeaturedImage || null)
      .input('CategoryId', sql.Int, postData.CategoryId || null)
      .input('UserId', sql.Int, postData.UserId || null) // Should be logged in user ID
      .input('Status', sql.NVarChar, 'draft') // Default to draft for security
      .input('IsFeatured', sql.Bit, postData.IsFeatured || false)
      .input('ReadTimeMinutes', sql.Int, postData.ReadTimeMinutes || null)
    
    const result = await request.query(`
        INSERT INTO Posts 
        (Title, Slug, Content, Excerpt, FeaturedImage, CategoryId, UserId, Status, IsFeatured, ReadTimeMinutes)
        VALUES (@Title, @Slug, @Content, @Excerpt, @FeaturedImage, @CategoryId, @UserId, @Status, @IsFeatured, @ReadTimeMinutes)
        
        SELECT CAST(SCOPE_IDENTITY() AS INT) as NewPostId
    `)
    
    const newPost = { ...postData, PostId: result.recordset[0].NewPostId }
    
    console.log(`Post created successfully with ID: ${newPost.PostId}`)
    return newPost
    
  } catch (error) {
    console.error('Error adding blog post:', error.message)
    throw new Error('Failed to create post. Please try again.')
  }
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(postId) {
  try {
    const pool = await getPool()
    
    const result = await pool.request()
      .input('PostId', sql.Int, postId)
      .query(`
        SELECT 
            p.*,
            u.DisplayName AS AuthorName,
            u.AvatarUrl,
            c.Name AS CategoryName,
            c.Description AS CategoryDescription,
            c.CreatedAt AS CategoryCreatedAt
        FROM Posts p
        INNER JOIN Users u ON p.UserId = u.UserId
        LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
        WHERE p.PostId = @PostId
      `)
    
    return result.recordset.length > 0 ? result.recordset[0] : null
    
  } catch (error) {
    console.error('Error getting blog post by ID:', error.message)
    return null
  }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(postId, updates) {
  try {
    const pool = await getPool()
    
    // First check if post exists and is editable
    const existingPost = await getBlogPostById(postId)
    if (!existingPost || existingPost.Status !== 'draft' && !updates.isPublished) {
      throw new Error('Cannot update published posts. Please publish a new post first.')
    }
    
    // Update allowed fields only (security: prevent mass assignment attack)
    const updateFields = {}
    if (updates.Title) updateFields.Title = updates.Title
    if (updates.Slug) updateFields.Slug = updates.Slug
    if (updates.Content) updateFields.Content = updates.Content
    if (updates.Excerpt) updateFields.Excerpt = updates.Excerpt
    if (updates.FeaturedImage) updateFields.FeaturedImage = updates.FeaturedImage
    if (updates.CategoryId !== undefined) updateFields.CategoryId = updates.CategoryId
    if (updates.UserId !== undefined) updateFields.UserId = updates.UserId
    if (updates.IsFeatured !== undefined) updateFields.IsFeatured = updates.IsFeatured
    if (updates.ReadTimeMinutes !== undefined) updateFields.ReadTimeMinutes = updates.ReadTimeMinutes
    
    // Only allow status update explicitly through this API
    if (updates.Status === 'published') {
      updateFields.Status = 'published'
      updateFields.UpdatedAt = sql.NVarchar('SYSDATETIME()')
      updateFields.ViewCount = 0 // Reset view count on republish
    } else if (updates.Status) {
      updateFields.Status = updates.Status
      updateFields.UpdatedAt = sql.NVarchar('SYSDATETIME()')
    }
    
    const request = pool.request()
      .input('PostId', sql.Int, postId)
      .input('Title', sql.NVarChar, updateFields.Title || null)
      .input('Slug', sql.NVarChar, updateFields.Slug || null)
      .input('Content', sql.NText, updateFields.Content || null)
      .input('Excerpt', sql.NVarChar, updateFields.Excerpt || null)
      .input('FeaturedImage', sql.NVarChar, updateFields.FeaturedImage || null)
      .input('CategoryId', sql.Int, updateFields.CategoryId || null)
      .input('UserId', sql.Int, updateFields.UserId || null)
      .input('Status', sql.NVarChar, updateFields.Status || null)
      .input('IsFeatured', sql.Bit, updateFields.IsFeatured || false)
      .input('ReadTimeMinutes', sql.Int, updateFields.ReadTimeMinutes || null)
    
    const result = await request.query(`
        UPDATE Posts
        SET Title = @Title,
            Slug = @Slug,
            Content = @Content,
            Excerpt = @Excerpt,
            FeaturedImage = @FeaturedImage,
            CategoryId = @CategoryId,
            UserId = @UserId,
            Status = @Status,
            IsFeatured = @IsFeatured,
            ReadTimeMinutes = @ReadTimeMinutes,
            UpdatedAt = SYSDATETIME()
        WHERE PostId = @PostId
        
        SELECT CAST(@PostId AS INT) as UpdatedPostId
    `)
    
    console.log(`Post updated successfully with ID: ${result.recordset[0].UpdatedPostId}`)
    return result.recordset[0]
    
  } catch (error) {
    console.error('Error updating blog post:', error.message)
    throw new Error('Failed to update post. Please try again.')
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(postId) {
  try {
    const pool = await getPool()
    
    // Check if post exists and is editable
    const existingPost = await getBlogPostById(postId)
    if (!existingPost || existingPost.Status !== 'draft') {
      throw new Error('Cannot delete published posts. Please create a new draft first.')
    }
    
    await pool.request()
      .input('PostId', sql.Int, postId)
      .query(`DELETE FROM Posts WHERE PostId = @PostId`)
    
    console.log(`Post deleted successfully with ID: ${postId}`)
    return true
    
  } catch (error) {
    console.error('Error deleting blog post:', error.message)
    throw new Error('Failed to delete post. Please try again.')
  }
}

/**
 * Check if a post with given slug already exists
 */
async function hasPostWithSlug(pool, slug) {
  const result = await pool.request()
    .input('Slug', sql.NVarChar, slug)
    .query('SELECT COUNT(*) as Count FROM Posts WHERE Slug = @Slug')
  
  return result.recordset[0].Count > 0
}

/**
 * Search posts by query string
 */
export async function searchPosts(query) {
  try {
    const pool = await getPool()
    
    const request = pool.request()
      .input('SearchQuery', sql.NVarChar, `%${query}%`)
    
    const result = await request.query(`
        SELECT 
            TOP (20)
            p.PostId,
            p.Title,
            p.Slug,
            p.Excerpt,
            p.FeaturedImage,
            p.Status,
            p.IsFeatured,
            p.ViewCount,
            p.CreatedAt,
            u.DisplayName AS AuthorName
        FROM Posts p
        INNER JOIN Users u ON p.UserId = u.UserId
        WHERE 
            -- Search in title and content (only for published posts)
            (p.Status = 'published' AND 
             (p.Title LIKE @SearchQuery OR p.Content LIKE @SearchQuery))
        ORDER BY 
            CASE WHEN p.IsFeatured = 1 THEN 0 ELSE 1 END,
            p.CreatedAt DESC
    `)
    
    return result.recordset
    
  } catch (error) {
    console.error('Error searching posts:', error.message)
    return []
  }
}

/**
 * Get categories with post counts
 */
export async function getCategories() {
  try {
    const pool = await getPool()
    
    const result = await pool.request().query(`
        SELECT 
            c.CategoryId,
            c.Name,
            c.Slug,
            c.Description,
            c.IsActive,
            COUNT(p.PostId) as PostCount
        FROM Categories c
        LEFT JOIN Posts p ON c.CategoryId = p.CategoryId AND p.Status = 'published'
        WHERE c.IsActive = 1
        GROUP BY 
            c.CategoryId, c.Name, c.Slug, c.Description, c.IsActive
        ORDER BY c.Name
    `)
    
    return result.recordset
    
  } catch (error) {
    console.error('Error getting categories:', error.message)
    return []
  }
}

/**
 * Get tags with post counts
 */
export async function getTags() {
  try {
    const pool = await getPool()
    
    const result = await pool.request().query(`
        SELECT 
            t.TagId,
            t.Name,
            t.Slug,
            COUNT(pt.PostId) as PostCount
        FROM Tags t
        INNER JOIN PostTags pt ON t.TagId = pt.TagId
        GROUP BY t.TagId, t.Name, t.Slug
        ORDER BY t.Name
    `)
    
    return result.recordset
    
  } catch (error) {
    console.error('Error getting tags:', error.message)
    return []
  }
}

/**
 * Get post with associated tags
 */
export async function getPostWithTags(postId) {
  try {
    const pool = await getPool()
    
    const result = await pool.request()
      .input('PostId', sql.Int, postId)
      .query(`
          SELECT 
              p.*,
              u.DisplayName AS AuthorName,
              u.AvatarUrl,
              c.Name AS CategoryName,
              c.Description AS CategoryDescription,
              STRING_AGG(t.Name, ', ') AS TagNames
          FROM Posts p
          INNER JOIN Users u ON p.UserId = u.UserId
          LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
          INNER JOIN PostTags pt ON p.PostId = pt.PostId
          INNER JOIN Tags t ON pt.TagId = t.TagId
          WHERE p.PostId = @PostId
          GROUP BY 
              p.*, u.DisplayName, u.AvatarUrl, c.Name, c.Description
      `)
    
    return result.recordset[0]
    
  } catch (error) {
    console.error('Error getting post with tags:', error.message)
    throw new Error('Failed to fetch post details.')
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  try {
    const pool = await getPool()
    await pool.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database:', error.message)
  }
}

// Auto-close connection when process exits
process.on('SIGINT', closeDatabase)
process.on('SIGTERM', closeDatabase)

export default sqlService