@'
EWBlog - MS SQL Server Database Setup & Configuration

This document provides complete instructions for setting up your EWBlog website with MS SQL Server database and all features.

---

## PART 1: Install Dependencies

### Option A: Using PowerShell (Windows)
```powershell
# In project directory: d:\MyGit\AI\AI\Ollama-sample-qwen3.59b
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
npm init -y
npm install mssql vite @vitejs/plugin-react react react-dom tailwindcss autoprefixer --save-dev
```

### Option B: Using Node.js CLI (if available)
```bash
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
npm install mssql
npm install -D vite @vitejs/plugin-react react react-dom tailwindcss
```

---

## PART 2: Install and Configure TypeScript

### Install Type Definitions
```bash
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
npm install --save-dev @types/react @types/react-dom
```

### Optional: Update vite.config.js for TypeScript
```javascript
// src/vite.config.ts (if using TypeScript)
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [require('@vitejs/plugin-react')()],
})
```

---

## PART 3: Database Setup (MSSQL Server)

### Prerequisites
1. **Install SQL Server**: https://www.microsoft.com/sql-server/install
2. **Create Database Account** in Azure SQL or local MSSQL:
   ```sql
   -- Example for local installation
   CREATE USER 'ewblog_user' FOR LOGIN 'ewblog_login';
   USE ewblog_user;
   ALTER ROLE db_datareader ADD MEMBER ewblog_user;
   ALTER ROLE db_datawriter ADD MEMBER ewblog_user;
   ```

### Steps to Load Sample Data

#### Option A: Using Azure SQL Database
1. Open **Azure Portal** -> Your Database -> Manage Databases
2. Click **New Query**, then paste this script from setup_ewblog.sql
3. Execute the script

#### Option B: Using Local MSSQL with Server Manager
1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your local database server (localhost)
3. Run this SQL:
   ```sql
   USE master;
   IF DB_ID('EWBlog') IS NULL 
     CREATE DATABASE 'EWBlog';
   -- Then execute setup_ewblog.sql
   ```

#### Option C: Using PowerShell with mssql driver
```powershell
# Install mssql package
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
npm install -g mssql

# Login to local server (localhost)
mssql connect LocalDataServer localhost ewblog_login
```

---

## PART 4: Update Server Configuration

### File: src/server.js
Replace the existing code with this:

```javascript
import http from 'http';
import path from 'path';
import mssql from 'mssql';

// Initialize database connection pool
let clientPool = null;
let isConnected = false;

const CLIENT_CONFIG = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_HOST || 'localhost',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Column naming convention for easier mapping in Node.js
    columnEncryption: false
  }
};

// Connect to database on startup
const connectToDatabase = async () => {
  if (clientPool) {
    isConnected = true;
    console.log('✓ Database connection established');
    return clientPool;
  }

  try {
    const pool = await mssql.connect(CLIENT_CONFIG);
    
    // Test connection by querying a sample post
    const result = await pool.request().query('SELECT TOP 5 * FROM Posts WHERE Status = \'published\' ORDER BY createdAt DESC');
    
    if (result.recordCount > 0) {
      isConnected = true;
      console.log(`✓ Connected! Found ${result.recordCount} published posts`);
      
      // Initialize sample data if needed
      postData = [/* your blog post data */];
      
    } else {
      console.warn('⚠ No published posts found. Sample data configured.');
      postData = [];
      isConnected = false;
    }
    
    clientPool = pool;
    return pool;
  } catch (error) {
    isConnected = false;
    console.error('✗ Database connection failed:', error.message);
    throw error;
  }
};

// Create server with database integration
const server = http.createServer((req, res) => {
  const timestamp = Date.now();
  
  // API endpoint for blog posts
  if (req.url.startsWith('/api/posts')) {
    const match = req.url.match(/\/posts\/(\d+)/);
    if (!match) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(postData));
      return;
    }
    
    const postId = parseInt(match[1]);
    const post = postData.find(p => p.id === postId);
    if (post) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(post));
    } else {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Post not found' }));
    }
    return;
  }
  
  // SPA routing: Home page
  if (req.url === '/') {
    if (!isConnected) {
      res.writeHead(302, {'Location': '/login'});
      return;
    }
    
    const indexPath = path.join(process.cwd(), 'index.html');
    let htmlContent = '';
    
    try {
      const fsModule = require('fs');
      htmlContent = fsModule.readFileSync(indexPath, 'utf8');
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(htmlContent);
    } catch (err) {
      console.error('[SERVER] Error:', err.message);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error');
    }
    return;
  }
  
  // Handle /login path if needed
  if (req.url === '/login') {
    const indexPath = path.join(process.cwd(), 'index.html');
    let htmlContent = '';
    
    try {
      const fsModule = require('fs');
      htmlContent = fsModule.readFileSync(indexPath, 'utf8');
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(htmlContent);
    } catch (err) {
      console.error('[SERVER] Error:', err.message);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error');
    }
    return;
  }
  
  // Serve index.html for all other paths
  if (req.url !== '/' && req.url !== '/login') {
    try {
      const indexPath = path.join(process.cwd(), 'index.html');
      let htmlContent = '';
      
      const fsModule = require('fs');
      htmlContent = fsModule.readFileSync(indexPath, 'utf8');
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(htmlContent);
    } catch (err) {
      console.error('[SERVER] Error:', err.message);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error');
    }
    return;
  }
});

// Initialize and start server
connectToDatabase().then(clientPool => {
  // If pool not established yet, initialize with sample data
  if (!isConnected) {
    connectToDatabase();
  }
  
  server.listen(PORT, () => {
    console.log(`\n🚀 EWBlog Server Started`);
    console.log(`   Port:     ${PORT}`);
    console.log(`   Access:   http://localhost:${PORT}/`);
    console.log(`   DB Status: ${isConnected ? '✓ Connected' : '✗ Not connected'}`);
    if (postData.length > 0) {
      console.log(`   Posts: ${postData.length}`);
    }
    
    process.on('SIGINT', () => server.close());
    process.on('SIGTERM', () => server.close());
  });
});

```

### Environment Variables (.env file in project root):
```env
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=<your_mssql_password>
DB_NAME=EWBlog
PORT=5173
```

---

## PART 5: Access Your Blog

Once setup is complete:

- **Homepage**: http://localhost/5173/
- **Login Page**: http://localhost/5173/login  
- **Sample Articles**: All visible without login access

---

## PART 6: Testing Database Connection

### Quick Test Command (if mssql installed):
```bash
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
mssql connect LocalDataServer localhost ewblog_login;
echo "Connection successful!"
```

---

## PART 7: Troubleshooting

### Issue: "Cannot find module 'mssql'"
**Solution**: Install mssql package
```bash
npm install -g mssql
```

### Issue: Database authentication failed
**Solution**: Verify credentials in `setup_ewblog.sql` and use correct password.

### Issue: 404 errors for blog posts
**Solution**: Ensure sample data is loaded into database and referenced correctly in server.js.

---

## PART 8: Next Steps (Optional Enhancements)

1. **Add MS SQL Server backend**: Update `src/server.mjs` to connect to actual MSSQL
2. **Update package.json**: Set port number explicitly (`PORT=5000`)
3. **Create React App**: Use the existing template structure
4. **Enable CORS** for external access (add to `package.json`)

---

## PART 9: Full Setup Script

Run this single command to set up everything:

```powershell
cd "d:\MyGit\AI\AI\Ollama-sample-qwen3.59b"
.\setup_complete.ps1
```

---

## Summary Checklist

- [ ] Install mssql package (`npm install -g mssql`)
- [ ] Login to MSSQL Server with correct credentials
- [ ] Load sample data from `setup_ewblog.sql` or execute in SSMS
- [ ] Update `src/server.js` with new connection code
- [ ] Test database connection (should print "✓ Database connected")
- [ ] Visit http://localhost/5173/ to see your blog homepage
- [ ] Visit http://localhost/5173/login to see login page

---

**For additional help, refer to SETUP_INSTRUCTIONS.txt file**
