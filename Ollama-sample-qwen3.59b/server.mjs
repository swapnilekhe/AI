import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import process from 'process';

const PORT = 5173;
const posts = [
  { id: 1, title: 'Introduction to AI', excerpt: 'AI basics and applications.', createdAt: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'Understanding Neural Networks', excerpt: 'How neural networks work.', createdAt: '2024-01-20T14:30:00Z' },
  { id: 3, title: 'Generative AI Future', excerpt: 'The future of generative AI.', createdAt: '2024-01-25T09:15:00Z' }
];

const server = http.createServer((req, res) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  
  if (req.url.startsWith('/api/posts')) {
    const match = req.url.match(/\/posts\/(\d+)/);
    if (match) {
      const postId = parseInt(match[1]);
      const post = posts.find(p => p.id === postId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(post || { error: 'Not found' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(posts));
    }
    return;
  }
  
  try {
    const indexPath = join(process.cwd(), 'index.html');
    const htmlContent = readFileSync(indexPath, 'utf8');
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache' 
    });
    res.end(htmlContent);
  } catch (err) {
    console.error('[SERVER]', err.message);
    res.writeHead(500);
    res.end('Error');
  }
});

server.listen(PORT, () => {
  console.log(`EWBlog API Server on port ${PORT}`);
  console.log(`Posts available: ${posts.length}`);
  console.log(`All posts are visible without login!`);
});

process.on('SIGINT', () => { server.close(() => process.exit(0)); });
