import http from 'http';

const PORT = process.env.PORT || 5173;
const posts = [
  { id: 1, title: 'Introduction to AI', excerpt: 'AI basics and applications.', createdAt: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'Understanding Neural Networks', excerpt: 'How neural networks work.', createdAt: '2024-01-20T14:30:00Z' },
  { id: 3, title: 'Generative AI Future', excerpt: 'The future of generative AI.', createdAt: '2024-01-25T09:15:00Z' }
];

// Node.js v24+ requires explicit await syntax for async functions
async function readFileSync(filePath) {
  return await import('fs').then(({ default: fs }) => fs.readFileSync(filePath, 'utf8'));
}

const server = http.createServer((req, res) => {
  const timestamp = Date.now();
  
  if (req.url.startsWith('/api/posts')) {
    const match = req.url.match(/\/posts\/(\d+)/);
    if (!match) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(posts));
      return;
    }
    
    const postId = parseInt(match[1]);
    const post = posts.find(p => p.id === postId);
    if (post) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(post));
    } else {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Post not found' }));
    }
    return;
  }
  
  // SPA routing: index.html
  try {
    const filePath = path.join(process.cwd(), 'index.html');
    const htmlContent = readFileSync(filePath);
    
    res.writeHead(200, {'Content-Type': 'text/html', 'Cache-Control': 'no-cache'});
    res.end(htmlContent);
  } catch (err) {
    console.error('[SERVER] Error serving index.html:', err.message);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Server Error');
  }
});

// Graceful shutdown
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
server.listen(PORT, () => {
  console.log(`\n✅ EWBlog Server started on port ${PORT}`);
  console.log('🌐 Access: http://localhost/' + PORT + '/');
  console.log('✅ Blog posts available: ' + posts.length);
});
