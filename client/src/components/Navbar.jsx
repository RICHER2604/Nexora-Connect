/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Search, Home, Users, Bell, MessageSquare, Menu, X, ArrowRight, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { io } from 'socket.io-client'
import moment from 'moment'
import { useLanguage } from '../utils/LanguageContext'

const Navbar = ({ setSidebarOpen, user }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const profileMenuRef = useRef(null)
  const notifMenuRef = useRef(null)
  const socket = useRef(null)

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('nexora_token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const filtered = res.data.filter(n => ['like', 'comment', 'share'].includes(n.type))
      setNotifications(filtered)
      setUnreadCount(filtered.filter(n => !n.isRead).length)
    } catch (err) {
      console.error('Notif error:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('nexora_token')
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Mark read error:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Socket connection
      socket.current = io(import.meta.env.VITE_API_URL)
      socket.current.on('newNotification', (data) => {
        if (data.recipientId === user._id) {
          if (['like', 'comment', 'share'].includes(data.notification.type)) {
            setNotifications(prev => [data.notification, ...prev])
            setUnreadCount(prev => prev + 1)
            toast('New Notification!', { icon: '🔔' })
          }
        }
      })

      return () => socket.current.disconnect()
    }
  }, [user])

  const handleSearch = async (q) => {
    setSearchQuery(q)
    if (q.length > 2) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/search?query=${q}`)
        setSearchResults(res.data)
        setShowResults(true)
      } catch (err) {
        console.error('Search error:', err)
      }
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleLogout = () => {
    toast.success('Logged out. See you soon! 👋')
    localStorage.removeItem('nexora_token')
    localStorage.removeItem('nexora_user')
    navigate('/login', { replace: true })
  }

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className='h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800'>
      {/* Left */}
      <div className='flex items-center gap-4 lg:w-[20%]'>
        <button
          onClick={() => setSidebarOpen(true)}
          className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:hidden text-gray-600 dark:text-gray-400'
        >
          <Menu className='w-6 h-6' />
        </button>
        <Link to='/' className='flex items-center hover:scale-105 transition-transform active:scale-95'>
          <img src={assets.logo} alt='Nexora Connect' className='h-10 w-10 scale-125 object-contain origin-right' />
          <span className='font-bold text-xl text-indigo-900 dark:text-indigo-400 hidden sm:block'>Nexora Connect</span>
        </Link>
      </div>

      {/* Center */}
      <div className='hidden md:flex items-center justify-between w-[50%] px-4'>
        <div className='flex items-center gap-6 text-gray-600 dark:text-gray-400'>
          <Link to='/' className='flex flex-col items-center gap-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group'>
            <Home className='w-5 h-5 group-hover:-translate-y-1 transition-transform' />
            <span className='text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity'>{t('home')}</span>
          </Link>
          <Link to='/connections' className='flex flex-col items-center gap-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group'>
            <Users className='w-5 h-5 group-hover:-translate-y-1 transition-transform' />
            <span className='text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity'>{t('friends')}</span>
          </Link>
          <Link to='/discover' className='flex flex-col items-center gap-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group'>
            <Search className='w-5 h-5 group-hover:-translate-y-1 transition-transform' />
            <span className='text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity'>{t('explore')}</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className='relative ml-4 flex-1 max-w-xs'>
          <div className='bg-slate-100 dark:bg-slate-800 flex items-center gap-2 p-2 rounded-xl focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 border border-transparent focus-within:border-indigo-200 dark:focus-within:border-indigo-800 transition-all'>
            <Search className='w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder={t('search_placeholder')}
              className='bg-transparent outline-none text-sm w-full text-gray-700 dark:text-gray-200'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              onFocus={() => searchQuery.length > 2 && setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
                  setShowResults(false);
                  e.target.blur();
                }
              }}
            />
            {searchQuery && (
              <X
                className='w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200'
                onClick={() => { setSearchQuery(''); setShowResults(false) }}
              />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className='absolute top-12 left-0 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in'>
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => { navigate(`/profile/${u._id}`); setSearchQuery(''); setShowResults(false) }}
                  className='p-3 flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700'
                >
                  <img src={u.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} className='w-8 h-8 rounded-full object-cover' alt='' />
                  <div>
                    <p className='text-xs font-bold text-gray-800 dark:text-white'>{u.fullName}</p>
                    <p className='text-[10px] text-gray-400'>@{u.username}</p>
                  </div>
                </div>
              ))}
              <div
                onClick={() => { navigate(`/discover?q=${encodeURIComponent(searchQuery)}`); setShowResults(false) }}
                className='p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
              >
                <span className='text-[10px] font-bold'>See all results</span>
                <ArrowRight size={14} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center gap-3 md:gap-4 justify-end lg:w-[20%]'>
        <div className='flex items-center gap-3 text-gray-500'>
          <div className='relative' ref={notifMenuRef}>
            <div 
              onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) markAllAsRead() }}
              className='relative cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl group'
            >
              <Bell className='w-5 h-5 group-hover:rotate-12 transition-transform' />
              {unreadCount > 0 && (
                <div className='absolute top-1 right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] text-white font-bold'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className='absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-fade-in'>
                 <div className='p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between'>
                    <h3 className='font-bold text-sm text-gray-800 dark:text-white'>{t('notifications')}</h3>
                    <span className='text-[10px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline'>{t('mark_all_read')}</span>
                 </div>
                 <div className='max-h-96 overflow-y-auto no-scrollbar'>
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          onClick={() => { navigate(n.link); setShowNotifMenu(false) }}
                          className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                        >
                           <img src={n.sender?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} className='w-10 h-10 rounded-full object-cover' alt='' />
                           <div className='min-w-0'>
                              <p className='text-xs text-gray-700 dark:text-gray-300 leading-snug'>
                                 <span className='font-bold text-gray-900 dark:text-white'>{n.sender?.fullName}</span> {n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented on your post' : n.type === 'share' ? 'shared your post to their story' : n.type === 'follow' ? 'started following you' : 'interacted with you'}
                              </p>
                              <p className='text-[10px] text-gray-400 mt-1'>{moment(n.createdAt).fromNow()}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className='p-8 text-center'>
                         <Bell className='w-8 h-8 text-slate-100 dark:text-slate-800 mx-auto mb-2' />
                         <p className='text-xs text-gray-400'>No notifications yet</p>
                      </div>
                    )}
                 </div>
                 <div onClick={() => { navigate('/notifications'); setShowNotifMenu(false) }} className='p-3 bg-slate-50 dark:bg-slate-900/50 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors'>
                    {t('view_all')}
                 </div>
              </div>
            )}
          </div>
          <div
            onClick={() => navigate('/messages')}
            className='p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all group'
          >
            <MessageSquare className='w-5 h-5 group-hover:scale-110 transition-transform' />
          </div>
        </div>

        {/* Custom Profile Dropdown */}
        <div className='relative' ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className='flex items-center gap-2 p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
          >
            <img
              src={user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={user?.fullName}
              className='w-8 h-8 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/30'
            />
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className='absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-fade-in'>
              {/* User info */}
              <div className='p-4 border-b border-slate-50 dark:border-slate-800'>
                <div className='flex items-center gap-3'>
                  <img
                    src={user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    className='w-10 h-10 rounded-full object-cover'
                    alt=''
                  />
                  <div className='min-w-0'>
                    <p className='font-bold text-sm text-gray-800 dark:text-white truncate'>{user?.fullName}</p>
                    <p className='text-xs text-gray-400 truncate'>@{user?.username}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className='p-2'>
                <button
                  onClick={() => { navigate('/profile'); setShowProfileMenu(false) }}
                  className='w-full flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left'
                >
                  <User className='w-4 h-4' /> {t('view_profile')}
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfileMenu(false) }}
                  className='w-full flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left'
                >
                  <Settings className='w-4 h-4' /> {t('settings')}
                </button>
                <div className='border-t border-slate-50 dark:border-slate-800 mt-1 pt-1'>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-3 p-3 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-left'
                  >
                    <LogOut className='w-4 h-4' /> {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
