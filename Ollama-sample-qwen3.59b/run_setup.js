// EWBlog Database Setup Script
const { createPool } = require('mssql');

async function setupEWBlog() {
    // Connect to SQL Server using ODBC for Windows compatibility
    const pool = createPool({
        driver: 'odbc',
        server: '.',
        database: 'master',
        port: 1433,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    });

    try {
        console.log('Connected to SQL Server.');
        
        // Check if EWBlog database exists, create if not
        const dbExists = await new Promise((resolve) => {
            pool.query('SELECT name FROM sys.databases WHERE name = ?').then(result => 
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
            port: 1433,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        try {
            // Create all tables
            const createTablesSql = `USE EWBlog;
GO
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(128) NOT NULL,
    DisplayName NVARCHAR(100),
    Bio NVARCHAR(500),
    AvatarUrl NVARCHAR(500),
    IsActive BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    LastLoginAt DATETIME2
);
GO
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);
GO
CREATE TABLE Posts (
    PostId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    Content NVARCHAR(MAX) NOT NULL,
    Excerpt NVARCHAR(500),
    FeaturedImage NVARCHAR(500),
    CategoryId INT FOREIGN KEY REFERENCES Categories(CategoryId),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Status NVARCHAR(20) DEFAULT 'draft' NOT NULL,
    IsFeatured BIT DEFAULT 0 NOT NULL,
    ReadTimeMinutes INT,
    ViewCount INT DEFAULT 0 NOT NULL,
    LikeCount INT DEFAULT 0 NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    PublishedAt DATETIME2
);
GO
CREATE TABLE Tags (
    TagId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL UNIQUE
);
GO
CREATE TABLE PostTags (
    PostTagId INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL FOREIGN KEY REFERENCES Posts(PostId),
    TagId INT NOT NULL FOREIGN KEY REFERENCES Tags(TagId)
);
GO
CREATE TABLE Comments (
    CommentId INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL FOREIGN KEY REFERENCES Posts(PostId),
    UserId INT FOREIGN KEY REFERENCES Users(UserId),
    AuthorName NVARCHAR(100) NOT NULL,
    AuthorEmail NVARCHAR(255),
    Content NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'pending' NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);
GO
CREATE TABLE Likes (
    LikeId INT IDENTITY(1,1) PRIMARY KEY,
    PostId INT NOT NULL FOREIGN KEY REFERENCES Posts(PostId),
    UserId INT FOREIGN KEY REFERENCES Users(UserId),
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);
GO
CREATE TABLE Sessions (
    SessionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Token NVARCHAR(500) NOT NULL,
    ExpireAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME() NOT NULL
);
GO
-- Insert sample data
INSERT INTO Categories (Name, Slug, Description) VALUES
(N'Technology', 'technology', 'Latest tech news and trends'),
(N'AI & ML', 'ai-ml', 'Artificial Intelligence insights'),
(N'Development', 'development', 'Software development tips'),
(N'Tutorials', 'tutorials', 'Step-by-step guides');
GO
INSERT INTO Tags (Name, Slug) VALUES
('Python', 'python'),
('JavaScript', 'javascript'),
('AI', 'ai'),
('Development', 'development'),
('Technology', 'technology');
GO
INSERT INTO Users (Username, Email, PasswordHash, Salt, DisplayName, Bio) VALUES
('admin', 'admin@ewblog.local', 'hashed_password_placeholder', 'salt_placeholder', 'Admin User', 'Site administrator'),
('john_doe', 'john@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'John Doe', 'Tech enthusiast'),
('sarah_smith', 'sarah@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'Sarah Smith', 'Developer');
GO

SELECT 'SUCCESS: All tables created in EWBlog database!' AS Result;
SELECT OBJECT_NAME(object_id) as TableName FROM sys.tables WHERE schema_id = 1 ORDER BY object_id;
`;

            // Execute the SQL script
            await new Promise((resolve, reject) => {
                ewblogPool.query(createTablesSql).then(resolve).catch(reject);
            });

        } finally {
            await ewblogPool.end();
        }

    } catch (error) {
        console.error('Error setting up EWBlog database:', error.message);
        if (error.detail && Array.isArray(error.detail)) {
            error.detail.forEach((err, i) => {
                console.error(`Detail ${i + 1}:`, err.message);
            });
        }
    } finally {
        await pool.end();
    }
}

setupEWBlog();
