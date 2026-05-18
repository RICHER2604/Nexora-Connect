/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { menuItemData } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../utils/LanguageContext'

const MenuItems = ({setSidebarOpen}) => {
  const { t } = useLanguage()
  const user = JSON.parse(localStorage.getItem('nexora_user'))
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/unread-count/${user._id}`)
        setUnreadCount(res.count || res.data.count || 0)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUnread()
    
    // Refresh occasionally or use sockets if already implemented for messages
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [user?._id])

  return (
    <div className='px-6 text-gray-600 dark:text-gray-400 space-y-1 font-medium'>
     {
        menuItemData.map(({to, label, Icon})=>(
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/'} 
              onClick={()=> setSidebarOpen(false)} 
              className={({ isActive })=> `px-3.5 py-2 flex items-center gap-3 rounded-xl transition-all relative ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-black' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`} 
            >
              <Icon className="w-5 h-5" />
              <span className='flex-1'>{label === 'Messages' ? t('messages') : label === 'Feed' ? t('feed') : label === 'Discover' ? t('explore') : label === 'Connections' ? t('friends') : label}</span>
              
              {label === 'Messages' && unreadCount > 0 && (
                <span className='absolute right-2 top-2 px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full min-w-[18px] flex items-center justify-center shadow-lg shadow-indigo-100 animate-bounce'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
        ))
     }
    </div>
  )
}

export default MenuItems