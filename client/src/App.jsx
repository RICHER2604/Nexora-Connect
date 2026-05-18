import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connection from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import PostDetails from './pages/PostDetails'
import Workplace from './pages/Workplace'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { LanguageProvider } from './utils/LanguageContext'

// Centralized API Configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Add token to every request automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle global errors (like token expiration)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Protected Route: only allow if JWT token is in localStorage
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('nexora_token')
  if (!token) return <Navigate to='/login' replace />
  return children
}

const App = () => {
  return (
    <LanguageProvider>
      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1e1b4b',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public route */}
        <Route path='/login' element={<Login />} />

        {/* Protected layout wrapper */}
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connection />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
          <Route path='settings' element={<Settings />} />
          <Route path='notifications' element={<Notifications />} />
          <Route path='post/:postId' element={<PostDetails />} />
          <Route path='workplace' element={<Workplace />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </LanguageProvider>
  )
}

export default App