import React from 'react'
import { useNavigate } from 'react-router-dom'
import MenuItems from './Menuitems'
import { PlusCircle, LogOut, Settings, HelpCircle, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../utils/LanguageContext'

const Sidebar = ({ setSidebarOpen, user }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleLogout = () => {
    toast.success('Logged out. See you soon! 👋')
    localStorage.removeItem('nexora_token')
    localStorage.removeItem('nexora_user')
    navigate('/login', { replace: true })
  }

  return (
    <div className='flex flex-col gap-6 p-4 w-[240px] xl:w-[280px] sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar'>

      {/* Menu Items */}
      <div className='flex flex-col gap-2'>
        <span className='text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2'>{t('menu')}</span>
        <MenuItems setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Shortcuts */}
      <div className='flex flex-col gap-2'>
        <span className='text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2'>{t('shortcuts')}</span>
        <div
          onClick={() => { navigate('/workplace'); setSidebarOpen(false) }}
          className='flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
        >
          <Briefcase className='w-5 h-5' />
          <span className='font-medium'>{t('workplace')}</span>
        </div>
        <div
          onClick={() => { navigate('/create-post'); setSidebarOpen(false) }}
          className='flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
        >
          <PlusCircle className='w-5 h-5' />
          <span className='font-medium'>{t('create_post')}</span>
        </div>
        <div
          onClick={() => { navigate('/settings'); setSidebarOpen(false) }}
          className='flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
        >
          <Settings className='w-5 h-5' />
          <span className='font-medium'>Settings</span>
        </div>
        <div
          onClick={() => { navigate('/discover'); setSidebarOpen(false) }}
          className='flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
        >
          <HelpCircle className='w-5 h-5' />
          <span className='font-medium'>Explore</span>
        </div>
      </div>

      {/* Profile Summary */}
      {user && (
        <div className='mt-auto p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex flex-col gap-4 items-center text-center border border-slate-100 dark:border-slate-800'>
          <img src={user.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt='' className='w-16 h-16 rounded-full object-cover border-2 border-indigo-50 dark:border-indigo-900/30' />
          <div>
            <p className='font-bold text-gray-800 dark:text-white'>{user.fullName}</p>
            <p className='text-xs text-gray-500'>@{user.username}</p>
          </div>
          <button
            onClick={() => { navigate('/profile'); setSidebarOpen(false) }}
            className='w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors'
          >
            View Profile
          </button>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className='flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/10 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all mt-2'
      >
        <LogOut className='w-5 h-5' />
        <span className='font-medium'>Logout</span>
      </button>
    </div>
  )
}

export default Sidebar