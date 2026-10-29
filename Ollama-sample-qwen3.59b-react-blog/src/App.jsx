import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { useAuth } from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/post/:id" element={<PostDetail />} />
        
        <Route path="/login" element={
          !useAuth().user && <Login />
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        <Route path="/create" element={
          <PrivateRoute>
            <CreatePost />
          </PrivateRoute>
        } />
        
        <Route path="/edit/:id" element={
          <PrivateRoute>
            <EditPost />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
