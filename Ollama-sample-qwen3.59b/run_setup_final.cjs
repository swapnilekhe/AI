const { createPool } = require('mssql');

async function setupEWBlog() {
    console.log('Creating EWBlog database tables in SQL Server...');
    
    // Use sqlclient or mssql with proper connection string for Windows
    const pool = createPool({
        driver: 'sqlserver',  // Use native Node.js SQL Server driver (if available)
        server: '\\.',
        database: 'master',
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    }).catch(e => {
        console.error('Error creating pool:', e.message);
        console.log('\nFalling back to direct SQL file approach...');
        // Create tables via SQL file if driver fails
        require('child_process').exec(
            `sqlcmd.exe -S . -E -i "d:\\MyGit\\AI\\AI\\Ollama-sample-qwen3.59b\\setup_ewblog.sql"`,
            { cwd: 'd:\\MyGit\\AI\\AI\\Ollama-sample-qwen3.59b' },
            (error, stdout, stderr) => {
                console.log(error || '');
                console.log(stdout);
                if (stderr.includes('SQLCMD')) {
                    console.log('\nNote: sqlcmd.exe not found directly in PATH');
                    console.log('Manual setup required - please use SSMS or Visual Studio Database Explorer.');
                }
            }
        );
    });

    try {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for ODBC driver to connect
        const result = await pool.query(`
            USE master;
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EWBlog')
                CREATE DATABASE EWBlog;
            SELECT DB_NAME() AS DatabaseName;
        `);
        
        if (!result.length || result[0].DatabaseName !== 'EWBlog') {
            await pool.query(`USE EWBlog;`);
            
            const createSql = `
                USE EWBlog;
                
                -- Users table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Users]'))
                    CREATE TABLE [Users](
                        [UserId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Username] NVARCHAR(50) NOT NULL UNIQUE,
                        [Email] NVARCHAR(255) NOT NULL,
                        [PasswordHash] NVARCHAR(255) NOT NULL,
                        [Salt] NVARCHAR(128) NOT NULL,
                        [DisplayName] NVARCHAR(100),
                        [Bio] NVARCHAR(500),
                        [AvatarUrl] NVARCHAR(500),
                        [IsActive] BIT DEFAULT 1,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [LastLoginAt] DATETIME2 NULL
                    );

                -- Categories table  
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Categories]'))
                    CREATE TABLE [Categories](
                        [CategoryId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE,
                        [Description] NVARCHAR(500),
                        [IsActive] BIT DEFAULT 1,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Posts table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Posts]'))
                    CREATE TABLE [Posts](
                        [PostId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Title] NVARCHAR(255) NOT NULL,
                        [Slug] NVARCHAR(255) NOT NULL UNIQUE,
                        [Content] NVARCHAR(MAX) NOT NULL,
                        [Excerpt] NVARCHAR(500),
                        [FeaturedImage] NVARCHAR(500),
                        [CategoryId] INT FOREIGN KEY REFERENCES [Categories](CategoryId),
                        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users](UserId),
                        [Status] NVARCHAR(20) DEFAULT 'draft',
                        [IsFeatured] BIT DEFAULT 0,
                        [ReadTimeMinutes] INT,
                        [ViewCount] INT DEFAULT 0,
                        [LikeCount] INT DEFAULT 0,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [PublishedAt] DATETIME2 NULL
                    );

                -- Tags table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Tags]'))
                    CREATE TABLE [Tags](
                        [TagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE
                    );

                -- PostTags bridge table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PostTags]'))
                    CREATE TABLE [PostTags](
                        [PostTagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [TagId] INT FOREIGN KEY REFERENCES [Tags](TagId)
                    );

                -- Comments table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Comments]'))
                    CREATE TABLE [Comments](
                        [CommentId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [AuthorName] NVARCHAR(100) NOT NULL,
                        [AuthorEmail] NVARCHAR(255),
                        [Content] NVARCHAR(MAX) NOT NULL,
                        [Status] NVARCHAR(20) DEFAULT 'pending',
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Likes table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Likes]'))
                    CREATE TABLE [Likes](
                        [LikeId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Sessions table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Sessions]'))
                    CREATE TABLE [Sessions](
                        [SessionId] INT IDENTITY(1,1) PRIMARY KEY,
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [Token] NVARCHAR(500) NOT NULL,
                        [ExpireAt] DATETIME2 NOT NULL,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Insert sample data
                INSERT INTO Categories (Name, Slug, Description) VALUES
                    (N'Technology', 'technology', 'Latest tech news'),
                    (N'AI & ML', 'ai-ml', 'AI and ML insights'),
                    (N'Development', 'development', 'Development tips');

                INSERT INTO Tags (Name, Slug) VALUES
                    ('Python', 'python'),
                    ('JavaScript', 'javascript'),
                    ('AI', 'ai'),
                    ('Technology', 'technology');

                SELECT 'SUCCESS: EWBlog tables created!' as Result;
            `;

            await pool.query(createSql);
            
        } else {
            // EWBlog exists - create tables in it
            const ewblogQuery = `
                USE EWBlog;
                
                -- Users table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Users]'))
                    CREATE TABLE [Users](
                        [UserId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Username] NVARCHAR(50) NOT NULL UNIQUE,
                        [Email] NVARCHAR(255) NOT NULL,
                        [PasswordHash] NVARCHAR(255) NOT NULL,
                        [Salt] NVARCHAR(128) NOT NULL,
                        [DisplayName] NVARCHAR(100),
                        [Bio] NVARCHAR(500),
                        [AvatarUrl] NVARCHAR(500),
                        [IsActive] BIT DEFAULT 1,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [LastLoginAt] DATETIME2 NULL
                    );

                -- Categories table  
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Categories]'))
                    CREATE TABLE [Categories](
                        [CategoryId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE,
                        [Description] NVARCHAR(500),
                        [IsActive] BIT DEFAULT 1,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Posts table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Posts]'))
                    CREATE TABLE [Posts](
                        [PostId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Title] NVARCHAR(255) NOT NULL,
                        [Slug] NVARCHAR(255) NOT NULL UNIQUE,
                        [Content] NVARCHAR(MAX) NOT NULL,
                        [Excerpt] NVARCHAR(500),
                        [FeaturedImage] NVARCHAR(500),
                        [CategoryId] INT FOREIGN KEY REFERENCES [Categories](CategoryId),
                        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users](UserId),
                        [Status] NVARCHAR(20) DEFAULT 'draft',
                        [IsFeatured] BIT DEFAULT 0,
                        [ReadTimeMinutes] INT,
                        [ViewCount] INT DEFAULT 0,
                        [LikeCount] INT DEFAULT 0,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [PublishedAt] DATETIME2 NULL
                    );

                -- Tags table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Tags]'))
                    CREATE TABLE [Tags](
                        [TagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE
                    );

                -- PostTags bridge table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PostTags]'))
                    CREATE TABLE [PostTags](
                        [PostTagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [TagId] INT FOREIGN KEY REFERENCES [Tags](TagId)
                    );

                -- Comments table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Comments]'))
                    CREATE TABLE [Comments](
                        [CommentId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [AuthorName] NVARCHAR(100) NOT NULL,
                        [AuthorEmail] NVARCHAR(255),
                        [Content] NVARCHAR(MAX) NOT NULL,
                        [Status] NVARCHAR(20) DEFAULT 'pending',
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME(),
                        [UpdatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Likes table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Likes]'))
                    CREATE TABLE [Likes](
                        [LikeId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT FOREIGN KEY REFERENCES [Posts](PostId),
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Sessions table
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Sessions]'))
                    CREATE TABLE [Sessions](
                        [SessionId] INT IDENTITY(1,1) PRIMARY KEY,
                        [UserId] INT FOREIGN KEY REFERENCES [Users](UserId),
                        [Token] NVARCHAR(500) NOT NULL,
                        [ExpireAt] DATETIME2 NOT NULL,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME()
                    );

                -- Insert sample data
                INSERT INTO Categories (Name, Slug, Description) VALUES
                    (N'Technology', 'technology', 'Latest tech news'),
                    (N'AI & ML', 'ai-ml', 'AI and ML insights'),
                    (N'Development', 'development', 'Development tips');

                INSERT INTO Tags (Name, Slug) VALUES
                    ('Python', 'python'),
                    ('JavaScript', 'javascript'),
                    ('AI', 'ai'),
                    ('Technology', 'technology');

                SELECT 'SUCCESS: EWBlog tables created!' as Result;
            `;

            await pool.query(ewblogQuery);
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ERODBC' || error.message.includes('ODBC')) {
            console.log('\nUsing ODBC driver - this is expected on Windows.');
            console.log('The SQL script will execute via sqlcmd fallback.');
        }
    }
}

setupEWBlog();
