import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, User } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="text-2xl font-bold text-blue-600">EWBlog</div>
      <div className="flex gap-6 items-center">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <a href="/login" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
          <User size={18} /> Login
        </a>
      </div>
    </nav>
  );
};
