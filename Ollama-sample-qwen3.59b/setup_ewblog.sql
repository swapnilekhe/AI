USE master;
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EWBlog')
BEGIN
    CREATE DATABASE [EWBlog];
    PRINT 'Database EWBlog created successfully.';
END
ELSE
    PRINT 'Database EWBlog already exists.';

-- Switch to the new or existing database
USE EWBlog;
GO

-- Table: Users
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users](
        [UserId] INT IDENTITY(1,1) NOT NULL,
        [Username] NVARCHAR(50) NOT NULL,
        [Email] NVARCHAR(255) NOT NULL,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [Salt] NVARCHAR(128) NOT NULL,
        [DisplayName] NVARCHAR(100),
        [Bio] NVARCHAR(500),
        [AvatarUrl] NVARCHAR(500),
        [isActive] BIT NOT NULL CONSTRAINT [DF_Users_isActive] DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Users_createdAt] DEFAULT SYSDATETIME(),
        [lastLoginAt] DATETIME2 NULL,
        PRIMARY KEY CLUSTERED ([UserId] ASC),
        UNIQUE NONCLUSTERED ([Username] ASC)
    );
END
GO

-- Table: Categories
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories](
        [CategoryId] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Slug] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500),
        [isActive] BIT NOT NULL CONSTRAINT [DF_Categories_isActive] DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Categories_createdAt] DEFAULT SYSDATETIME(),
        PRIMARY KEY CLUSTERED ([CategoryId] ASC),
        UNIQUE NONCLUSTERED ([Slug] ASC)
    );
END
GO

-- Table: Posts
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Posts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Posts](
        [PostId] INT IDENTITY(1,1) NOT NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Slug] NVARCHAR(255) NOT NULL,
        [Content] NVARCHAR(MAX) NOT NULL,
        [Excerpt] NVARCHAR(500),
        [FeaturedImage] NVARCHAR(500),
        [CategoryId] INT NULL,
        [UserId] INT NOT NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Posts_Status] DEFAULT 'draft',
        [IsFeatured] BIT NOT NULL CONSTRAINT [DF_Posts_IsFeatured] DEFAULT 0,
        [ReadTimeMinutes] INT NULL,
        [ViewCount] INT NOT NULL CONSTRAINT [DF_Posts_ViewCount] DEFAULT 0,
        [LikeCount] INT NOT NULL CONSTRAINT [DF_Posts_LikeCount] DEFAULT 0,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Posts_createdAt] DEFAULT SYSDATETIME(),
        [updatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Posts_updatedAt] DEFAULT SYSDATETIME(),
        [publishedAt] DATETIME2 NULL,
        PRIMARY KEY CLUSTERED ([PostId] ASC),
        UNIQUE NONCLUSTERED ([Slug] ASC),
        FOREIGN KEY([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]),
        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

-- Table: Tags
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tags]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Tags](
        [TagId] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Slug] NVARCHAR(100) NOT NULL,
        PRIMARY KEY CLUSTERED ([TagId] ASC),
        UNIQUE NONCLUSTERED ([Slug] ASC)
    );
END
GO

-- Table: PostTags (Bridge table for Many-Many relationship)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PostTags]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PostTags](
        [PostTagId] INT IDENTITY(1,1) NOT NULL,
        [PostId] INT NOT NULL,
        [TagId] INT NOT NULL,
        PRIMARY KEY CLUSTERED ([PostTagId] ASC),
        FOREIGN KEY([PostId]) REFERENCES [dbo].[Posts]([PostId]),
        FOREIGN KEY([TagId]) REFERENCES [dbo].[Tags]([TagId])
    );
END
GO

-- Table: Comments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Comments](
        [CommentId] INT IDENTITY(1,1) NOT NULL,
        [PostId] INT NOT NULL,
        [UserId] INT NULL,
        [AuthorName] NVARCHAR(100) NOT NULL,
        [AuthorEmail] NVARCHAR(255),
        [Content] NVARCHAR(MAX) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Comments_Status] DEFAULT 'pending',
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Comments_createdAt] DEFAULT SYSDATETIME(),
        [updatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Comments_updatedAt] DEFAULT SYSDATETIME(),
        PRIMARY KEY CLUSTERED ([CommentId] ASC),
        FOREIGN KEY([PostId]) REFERENCES [dbo].[Posts]([PostId]),
        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

-- Table: Likes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Likes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Likes](
        [LikeId] INT IDENTITY(1,1) NOT NULL,
        [PostId] INT NOT NULL,
        [UserId] INT NULL,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Likes_createdAt] DEFAULT SYSDATETIME(),
        PRIMARY KEY CLUSTERED ([LikeId] ASC),
        FOREIGN KEY([PostId]) REFERENCES [dbo].[Posts]([PostId]),
        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

-- Table: Sessions (for authentication)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Sessions](
        [SessionId] INT IDENTITY(1,1) NOT NULL,
        [UserId] INT NOT NULL,
        [Token] NVARCHAR(500) NOT NULL,
        [ExpireAt] DATETIME2 NOT NULL,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_Sessions_createdAt] DEFAULT SYSDATETIME(),
        PRIMARY KEY CLUSTERED ([SessionId] ASC),
        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([UserId])
    );
END
GO

-- Create indexes for performance optimization
CREATE NONCLUSTERED INDEX [IX_Posts_CategoryId] ON [dbo].[Posts]([CategoryId]);
CREATE NONCLUSTERED INDEX [IX_Posts_UserId] ON [dbo].[Posts]([UserId]);
CREATE NONCLUSTERED INDEX [IX_Comments_PostId] ON [dbo].[Comments]([PostId]);
CREATE NONCLUSTERED INDEX [IX_Likes_PostId] ON [dbo].[Likes]([PostId]);

-- Insert sample data for testing
PRINT '';
PRINT 'Inserting sample data...';
PRINT '';

INSERT INTO [Categories] ([Name], [Slug], [Description]) VALUES
(N'Technology', 'technology', 'Latest tech news and trends'),
(N'AI & ML', 'ai-ml', 'Artificial Intelligence and Machine Learning insights'),
(N'Development', 'development', 'Software development tips and tutorials'),
(N'Tutorials', 'tutorials', 'Step-by-step guides for learning new skills');

INSERT INTO [Tags] ([Name], [Slug]) VALUES
('Python', 'python'),
('JavaScript', 'javascript'),
('AI', 'ai'),
('Machine Learning', 'machine-learning'),
('Development', 'development'),
('Technology', 'technology');

INSERT INTO [Users] ([Username], [Email], [PasswordHash], [Salt], [DisplayName], [Bio]) VALUES
('admin', 'admin@ewblog.local', 'hashed_password_placeholder', 'salt_placeholder', 'Admin User', 'Site administrator'),
('john_doe', 'john@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'John Doe', 'Tech enthusiast'),
('sarah_smith', 'sarah@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'Sarah Smith', 'Developer and blogger');

PRINT '';
PRINT 'SUCCESS: All tables created successfully in EWBlog database!';
PRINT '';
PRINT 'Tables created:';
PRINT '  - Users (authentication and profile)';
PRINT '  - Posts (blog articles)';
PRINT '  - Categories (organize posts)';
PRINT '  - Tags (topic tags for posts)';
PRINT '  - PostTags (many-to-many relation between posts and tags)';
PRINT '  - Comments (user comments on posts)';
PRINT '  - Likes (user likes on posts)';
PRINT '  - Sessions (authentication sessions)';
PRINT '';
PRINT 'Sample data inserted:';
PRINT '  - 4 Categories';
PRINT '  - 6 Tags';
PRINT '  - 3 Users';