// EWBlog Database Setup Script
const { createPool } = require('mssql');

async function setupEWBlog() {
    // Connect to SQL Server using Windows Authentication (Integrated Security)
    const pool = createPool({
        driver: 'odbc',  // Use ODBC for Windows integration
        server: '.',     // Local SQL Server
        database: 'master',
        options: {
            encrypt: false,
            trustServerCertificate: true
        },
        connectionTimeout: 30000
    });

    try {
        // Check if EWBlog database exists, create if not
        const dbExists = await new Promise((resolve, reject) => {
            pool.query('SELECT name FROM sys.databases WHERE name = ?', ['EWBlog']).then(result => 
                resolve(result.length > 0)
            ).catch(reject);
        });

        if (!dbExists) {
            await new Promise(resolve => 
                pool.query('CREATE DATABASE EWBlog').then(resolve)
            );
            console.log('Database EWBlog created successfully.');
        } else {
            console.log('Database EWBlog already exists.');
        }

        // Connect to EWBlog database
        const ewblogPool = createPool({
            driver: 'odbc',
            server: '.',
            database: 'EWBlog',
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        try {
            // Create all tables using T-SQL batch commands
            const createTablesSql = \
USE EWBlog;
GO

-- Users table
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
);

-- Categories table
CREATE TABLE [Categories] (
    [CategoryId] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(500),
    [IsActive] BIT DEFAULT 1 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);

-- Posts table
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
);

-- Tags table
CREATE TABLE [Tags] (
    [TagId] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL UNIQUE
);

-- PostTags bridge table
CREATE TABLE [PostTags] (
    [PostTagId] INT IDENTITY(1,1) PRIMARY KEY,
    [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
    [TagId] INT NOT NULL FOREIGN KEY REFERENCES [Tags]([TagId])
);

-- Comments table
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
);

-- Likes table
CREATE TABLE [Likes] (
    [LikeId] INT IDENTITY(1,1) PRIMARY KEY,
    [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);

-- Sessions table
CREATE TABLE [Sessions] (
    [SessionId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users]([UserId]),
    [Token] NVARCHAR(500) NOT NULL,
    [ExpireAt] DATETIME2 NOT NULL,
    [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);

-- Create indexes for performance
CREATE NONCLUSTERED INDEX [IX_Posts_CategoryId] ON [Posts]([CategoryId]);
CREATE NONCLUSTERED INDEX [IX_Posts_UserId] ON [Posts]([UserId]);
CREATE NONCLUSTERED INDEX [IX_Comments_PostId] ON [Comments]([PostId]);
CREATE NONCLUSTERED INDEX [IX_Likes_PostId] ON [Likes]([PostId]);

PRINT 'Tables created successfully!';
GO

-- Insert sample data
INSERT INTO Categories (Name, Slug, Description) VALUES
(N'Technology', 'technology', 'Latest tech news and trends'),
(N'AI & ML', 'ai-ml', 'Artificial Intelligence and Machine Learning insights'),
(N'Development', 'development', 'Software development tips and tutorials'),
(N'Tutorials', 'tutorials', 'Step-by-step guides for learning new skills');

INSERT INTO Tags (Name, Slug) VALUES
('Python', 'python'),
('JavaScript', 'javascript'),
('AI', 'ai'),
('Machine Learning', 'machine-learning'),
('Development', 'development'),
('Technology', 'technology');

INSERT INTO Users (Username, Email, PasswordHash, Salt, DisplayName, Bio) VALUES
('admin', 'admin@ewblog.local', 'hashed_password_placeholder', 'salt_placeholder', 'Admin User', 'Site administrator'),
('john_doe', 'john@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'John Doe', 'Tech enthusiast'),
('sarah_smith', 'sarah@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'Sarah Smith', 'Developer and blogger');

SELECT 'Sample data inserted successfully!' AS Result;
GO\;

            // Execute the SQL script
            await new Promise((resolve, reject) => {
                ewblogPool.query(createTablesSql).then(resolve).catch(reject);
            });

        } finally {
            await ewblogPool.end();
        }

    } catch (error) {
        console.error('Error setting up EWBlog database:', error.message);
    } finally {
        await pool.end();
    }
}

setupEWBlog();
