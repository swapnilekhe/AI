import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  title: string;
  summary?: string;
  imageUrl?: string;
  category?: { name: string };
  author?: { fullName: string };
}

export const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading posts...</div>;

  return (
    <main className="max-w-6xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold mb-4">Explore Stories</h1>
        <p className="text-slate-500">Discover the latest insights from our community.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <motion.div 
            key={post.id}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
          >
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded-xl mb-4 w-full h-48 object-cover" />}
            <span className="text-xs font-bold uppercase text-blue-500">{post.category?.name}</span>
            <h2 className="text-2xl font-bold mt-2 mb-3">{post.title}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{post.summary}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">By {post.author?.fullName}</span>
              <button className="text-blue-600 font-semibold">Read More →</button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};
