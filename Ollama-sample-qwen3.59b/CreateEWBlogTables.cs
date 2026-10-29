using System;
using System.Data.SqlClient;

class Program
{
    static void Main()
    {
        string server = ".";
        string database = "EWBlog";

        try
        {
            string connectionString = $"Server={server};Database=master;Integrated Security=true;Trust Server Certificate=true;";
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Create database if not exists
                string createDbQuery = $@"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '{database}') 
                                          BEGIN 
                                              CREATE DATABASE [{database}] 
                                          END";
                SqlCommand cmd = new SqlCommand(createDbQuery, conn);
                cmd.ExecuteNonQuery();
                Console.WriteLine("Database EWBlog created or already exists.");
            }
            
            // Connect to the EWBlog database
            string connection2 = $"Server={server};Database={database};Integrated Security=true;Trust Server Certificate=true;";
            using (SqlConnection conn = new SqlConnection(connection2))
            {
                conn.Open();
                
                cmd = new SqlCommand(@"
                    USE EWBlog;

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

                    CREATE TABLE [Categories] (
                        [CategoryId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE,
                        [Description] NVARCHAR(500),
                        [IsActive] BIT DEFAULT 1 NOT NULL,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
                    );

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

                    CREATE TABLE [Tags] (
                        [TagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [Name] NVARCHAR(100) NOT NULL,
                        [Slug] NVARCHAR(100) NOT NULL UNIQUE
                    );

                    CREATE TABLE [PostTags] (
                        [PostTagId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
                        [TagId] INT NOT NULL FOREIGN KEY REFERENCES [Tags]([TagId])
                    );

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

                    CREATE TABLE [Likes] (
                        [LikeId] INT IDENTITY(1,1) PRIMARY KEY,
                        [PostId] INT NOT NULL FOREIGN KEY REFERENCES [Posts]([PostId]),
                        [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
                    );

                    CREATE TABLE [Sessions] (
                        [SessionId] INT IDENTITY(1,1) PRIMARY KEY,
                        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [Users]([UserId]),
                        [Token] NVARCHAR(500) NOT NULL,
                        [ExpireAt] DATETIME2 NOT NULL,
                        [CreatedAt] DATETIME2 DEFAULT SYSDATETIME() NOT NULL
                    );

                    PRINT 'Tables created successfully!';
                ", conn);
                
                cmd.ExecuteNonQuery();
                
                // Insert sample data
                cmd.CommandText = @"
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
                ";
                
                cmd.ExecuteNonQuery();
                
                Console.WriteLine("");
                Console.WriteLine("=== SUCCESS: All tables created in EWBlog database! ===");
                Console.WriteLine("");
                Console.WriteLine("Tables created:");
                Console.WriteLine("  - Users (authentication and profile)");
                Console.WriteLine("  - Posts (blog articles)");
                Console.WriteLine("  - Categories (organize posts)");
                Console.WriteLine("  - Tags (topic tags for posts)");
                Console.WriteLine("  - PostTags (many-to-many relation between posts and tags)");
                Console.WriteLine("  - Comments (user comments on posts)");
                Console.WriteLine("  - Likes (user likes on posts)");
                Console.WriteLine("  - Sessions (authentication sessions)");
                Console.WriteLine("");
                Console.WriteLine("Sample data inserted:");
                Console.WriteLine("  - 4 Categories");
                Console.WriteLine("  - 6 Tags");
                Console.WriteLine("  - 3 Users");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
            if (ex.InnerException != null)
            {
                Console.WriteLine("Inner Error: " + ex.InnerException.Message);
            }
        }
    }
}
