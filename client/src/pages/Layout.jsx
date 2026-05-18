import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import RightSidebar from '../components/RightSidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Loading from '../components/Loading'
import axios from 'axios'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(() => {
    // Load from cache immediately (avoids flash of loading)
    const cached = localStorage.getItem('nexora_user')
    return cached ? JSON.parse(cached) : null
  })
  const [loading, setLoading] = useState(!user) // only show spinner if no cache

  useEffect(() => {
    // Theme Initialization
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const fetchMe = async () => {
      const token = localStorage.getItem('nexora_token')
      if (!token) {
        navigate('/login', { replace: true })
        return
      }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
        localStorage.setItem('nexora_user', JSON.stringify(res.data))
      } catch (err) {
        console.error('Session error:', err)
        // Token invalid or expired — clear and redirect
        localStorage.removeItem('nexora_token')
        localStorage.removeItem('nexora_user')
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='w-full min-h-screen bg-slate-100 dark:bg-[#0a0a1a] flex flex-col'>
      <Navbar setSidebarOpen={setSidebarOpen} user={user} />

      <div className='flex flex-1 max-w-7xl mx-auto w-full relative'>
        {/* Left Sidebar */}
        <div className={`fixed sm:static bg-white dark:bg-slate-900 sm:bg-transparent z-40 transition-all duration-300 h-full sm:h-auto ${sidebarOpen ? 'left-0' : '-left-full'}`}>
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
        </div>

        {/* Center Content */}
        <div className='flex-1 w-full sm:px-4'>
          <Outlet context={{ user }} />
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Menu Toggle */}
      {!sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(true)}
          className='fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer sm:hidden z-50'
        >
          <Menu className='w-6 h-6' />
        </div>
      )}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className='fixed inset-0 bg-black/50 z-30 sm:hidden'
        />
      )}
    </div>
  )
}

export default Layout