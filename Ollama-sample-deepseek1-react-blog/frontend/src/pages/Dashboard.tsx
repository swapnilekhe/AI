import { useState } from 'react';

export const Dashboard = () => {
  const [posts, setPosts] = useState<any[]>([]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Author Dashboard</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        <table className="w-full text-left">
          <thead className="border-b">
            <tr className="border-b">
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {posts.map((post, i) => (
              <tr key={i}>
                <td className="p-2">{post.title}</td>
                <td className="p-2">{post.isPublished ? 'Published' : 'Draft'}</td>
                <td className="p-2">
                  <button className="text-blue-600">Edit</button>
                  <button className="ml-4 text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
