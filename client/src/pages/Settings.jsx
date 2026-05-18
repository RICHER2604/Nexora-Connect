import React, { useState, useEffect, useRef } from 'react'
import { User, Bell, Shield, Eye, HelpCircle, LogOut, ChevronRight, Moon, Globe, X, Camera, MapPin, Info, Save, Loader2, Sun, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../utils/LanguageContext'

const Settings = () => {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('nexora_user')))
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const editProfilePicRef = useRef(null)
  const [notifSettings, setNotifSettings] = useState(currentUser?.notificationSettings || {
    push: true,
    messages: true,
    activity: true
  })

  const [editForm, setEditForm] = useState({
    fullName: currentUser?.fullName || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    profilePic: currentUser?.profilePic || ''
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setEditForm(prev => ({ ...prev, profilePic: reader.result }))
    }
  }

  // Handle Dark Mode Toggle Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    toast.success(`${newMode ? 'Dark' : 'Light'} mode enabled!`, { id: 'theme-toggle' });
  };

  const handleLogout = () => {
    toast.success('Logged out successfully 👋')
    localStorage.removeItem('nexora_token')
    localStorage.removeItem('nexora_user')
    navigate('/login', { replace: true })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('nexora_token')
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/update/${currentUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedUser = { ...currentUser, ...res.data }
      setCurrentUser(updatedUser)
      localStorage.setItem('nexora_user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
      setIsEditModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifSettings = async (updatedSettings) => {
    try {
      const token = localStorage.getItem('nexora_token')
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/settings`, updatedSettings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedUser = { ...currentUser, notificationSettings: res.data.notificationSettings }
      setCurrentUser(updatedUser)
      localStorage.setItem('nexora_user', JSON.stringify(updatedUser))
      setNotifSettings(res.data.notificationSettings)
      toast.success('Preferences updated!')
    } catch (err) {
      console.error('Update preferences error:', err)
      toast.error('Failed to update preferences')
    }
  }

  const toggleNotif = (type) => {
    const updated = { ...notifSettings, [type]: !notifSettings[type] }
    setNotifSettings(updated)
    handleUpdateNotifSettings(updated)
  }

  const sections = [
    {
      title: t('account'),
      items: [
        { 
          icon: <User className='w-5 h-5 text-blue-500' />, 
          label: t('profile_info'), 
          detail: 'Username, Bio, Location',
          onClick: () => setIsEditModalOpen(true)
        },
        { 
          icon: <Shield className='w-5 h-5 text-green-500' />, 
          label: t('privacy'), 
          detail: 'Password, Two-factor',
          onClick: () => toast('Security settings coming soon!', { icon: '🔐' })
        },
      ]
    },
    {
      title: t('preferences'),
      items: [
        { 
          icon: darkMode ? <Moon className='w-5 h-5 text-indigo-500' /> : <Sun className='w-5 h-5 text-amber-500' />, 
          label: t('appearance'), 
          detail: darkMode ? 'Dark Mode Active' : 'Light Mode Active',
          onClick: toggleTheme
        },
        { 
          icon: <Bell className='w-5 h-5 text-amber-500' />, 
          label: t('notifications'), 
          detail: 'Push, Messages, Activity',
          onClick: () => setIsNotificationModalOpen(true)
        },
        { 
          icon: <Globe className='w-5 h-5 text-emerald-500' />, 
          label: t('language'), 
          detail: lang === 'en' ? 'English' : 'हिंदी (Hindi)',
          onClick: () => setIsLanguageModalOpen(true)
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          icon: <HelpCircle className='w-5 h-5 text-rose-500' />, 
          label: t('help_center'), 
          detail: t('faq_detail'),
          onClick: () => setIsHelpModalOpen(true)
        },
        { icon: <Eye className='w-5 h-5 text-slate-500' />, label: 'About', detail: 'Version 1.0.0' },
      ]
    }
  ]

  return (
    <div className='py-6 max-w-2xl mx-auto animate-fade-in pb-20 px-4'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6 dark:text-white'>{t('settings')}</h1>

      <div className='space-y-8'>
        {/* User Card */}
        <div className='bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <img
              src={currentUser?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt=''
              className='w-16 h-16 rounded-2xl object-cover shadow-md'
            />
            <div>
              <h2 className='font-bold text-lg text-gray-800 dark:text-white'>{currentUser?.fullName}</h2>
              <p className='text-sm text-gray-500'>@{currentUser?.username}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className='text-indigo-600 text-sm font-bold px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 transition-all'
          >
            Edit
          </button>
        </div>

        {/* Setting Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className='space-y-4'>
            <h3 className='text-xs font-bold text-gray-400 uppercase tracking-widest pl-2'>{section.title}</h3>
            <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden'>
              {section.items.map((item, i) => (
                <div
                  key={i}
                  onClick={item.onClick}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${i !== section.items.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
                >
                  <div className='flex items-center gap-4'>
                    <div className='p-2 bg-slate-50 dark:bg-slate-800 rounded-xl'>
                      {item.icon}
                    </div>
                    <div>
                      <p className='text-sm font-bold text-gray-800 dark:text-white'>{item.label}</p>
                      <p className='text-[10px] text-gray-400'>{item.detail}</p>
                    </div>
                  </div>
                  <ChevronRight className='w-4 h-4 text-gray-300' />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className='w-full flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-3xl font-bold hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/20'
        >
          <LogOut className='w-5 h-5' />
          <span>Logout from Nexora Connect</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
           <div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800'>
              <div className='p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800'>
                 <h2 className='text-xl font-black text-gray-800 dark:text-white'>{t('edit_profile')}</h2>
                 <button onClick={() => setIsEditModalOpen(false)} className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all'>
                    <X size={20} className='text-gray-400' />
                 </button>
              </div>

              <form onSubmit={handleUpdateProfile} className='p-8 space-y-6'>
                 {/* Profile Pic Upload */}
                 <div className='flex flex-col items-center mb-4'>
                    <input 
                      type='file' 
                      hidden 
                      ref={editProfilePicRef} 
                      accept='image/*' 
                      onChange={handleImageChange} 
                    />
                    <div 
                      onClick={() => editProfilePicRef.current?.click()}
                      className='relative group cursor-pointer'
                    >
                       <img 
                        src={editForm.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                        alt='' 
                        className='w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl' 
                       />
                       <div className='absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all'>
                          <Camera size={24} className='text-white' />
                       </div>
                    </div>
                    <p className='text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-wider'>Change Photo</p>
                 </div>

                 <div className='space-y-4'>
                    <div className='relative group'>
                       <User className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500' />
                       <input 
                        type='text' 
                        placeholder='Full Name'
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className='w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/20 text-sm dark:text-white'
                       />
                    </div>

                    <div className='relative group'>
                       <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500' />
                       <input 
                        type='text' 
                        placeholder='Location'
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className='w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/20 text-sm dark:text-white'
                       />
                    </div>

                    <div className='relative group'>
                       <Info className='absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500' />
                       <textarea 
                        placeholder='Tell something about yourself...'
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className='w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/20 text-sm resize-none dark:text-white'
                       />
                    </div>
                 </div>

                 <div className='flex gap-4 pt-4'>
                    <button 
                      type='button' 
                      onClick={() => setIsEditModalOpen(false)}
                      className='flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-slate-200 transition-all'
                    >
                       Cancel
                    </button>
                    <button 
                      type='submit'
                      disabled={loading}
                      className='flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2'
                    >
                       {loading ? <Loader2 size={18} className='animate-spin' /> : <><Save size={18} /> {t('save')}</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
      {/* Notification Preferences Modal */}
      {isNotificationModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
           <div className='bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800'>
              <div className='p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800'>
                 <h2 className='text-xl font-black text-gray-800 dark:text-white'>Notifications</h2>
                 <button onClick={() => setIsNotificationModalOpen(false)} className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all'>
                    <X size={20} className='text-gray-400' />
                 </button>
              </div>

              <div className='p-8 space-y-6'>
                 {[
                   { id: 'push', label: 'Push Notifications', desc: 'Alerts on your device' },
                   { id: 'messages', label: 'Direct Messages', desc: 'New message alerts' },
                   { id: 'activity', label: 'Account Activity', desc: 'Likes, Comments, Follows' }
                 ].map((notif) => (
                   <div key={notif.id} className='flex items-center justify-between'>
                      <div>
                         <p className='text-sm font-bold text-gray-800 dark:text-white'>{notif.label}</p>
                         <p className='text-[10px] text-gray-400'>{notif.desc}</p>
                      </div>
                      <div 
                        onClick={() => toggleNotif(notif.id)}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${notifSettings[notif.id] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${notifSettings[notif.id] ? 'left-7' : 'left-1'}`} />
                      </div>
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => setIsNotificationModalOpen(false)}
                   className='w-full py-4 mt-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all'
                 >
                    Done
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Language Preferences Modal */}
      {isLanguageModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
           <div className='bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800'>
              <div className='p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800'>
                 <h2 className='text-xl font-black text-gray-800 dark:text-white'>{t('language')}</h2>
                 <button onClick={() => setIsLanguageModalOpen(false)} className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all'>
                    <X size={20} className='text-gray-400' />
                 </button>
              </div>

              <div className='p-8 space-y-4'>
                 {[
                   { id: 'en', label: 'English', desc: 'Default system language' },
                   { id: 'hi', label: 'हिंदी (Hindi)', desc: 'भारतीय भाषा (Indian Language)' }
                 ].map((l) => (
                   <div 
                    key={l.id} 
                    onClick={() => { setLang(l.id); setIsLanguageModalOpen(false); toast.success(`Language changed to ${l.label}`) }}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${lang === l.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                   >
                      <div>
                         <p className='text-sm font-bold text-gray-800 dark:text-white'>{l.label}</p>
                         <p className='text-[10px] text-gray-400'>{l.desc}</p>
                      </div>
                      {lang === l.id && <Check className='w-5 h-5 text-indigo-600' />}
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => setIsLanguageModalOpen(false)}
                   className='w-full py-4 mt-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all'
                 >
                    {t('done')}
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Help Center Modal */}
      {isHelpModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
           <div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800'>
              <div className='p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800'>
                 <h2 className='text-xl font-black text-gray-800 dark:text-white'>{t('help_center')}</h2>
                 <button onClick={() => setIsHelpModalOpen(false)} className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all'>
                    <X size={20} className='text-gray-400' />
                 </button>
              </div>

              <div className='p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar'>
                 <div className='text-center mb-4'>
                    <div className='w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4'>
                       <HelpCircle size={32} className='text-rose-500' />
                    </div>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>{t('support_desc')}</p>
                 </div>

                 <div className='space-y-4'>
                    <h3 className='text-xs font-bold text-gray-400 uppercase tracking-widest'>{t('faq_detail')}</h3>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl'>
                         <p className='text-sm font-bold text-gray-800 dark:text-white mb-1'>{t(`faq_${i}_q`)}</p>
                         <p className='text-[10px] text-gray-500 dark:text-gray-400'>{t(`faq_${i}_a`)}</p>
                      </div>
                    ))}
                 </div>

                 <div className='pt-4'>
                    <button 
                      onClick={() => { setIsHelpModalOpen(false); toast.success('Redirecting to support...') }}
                      className='w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all'
                    >
                       {t('contact_us')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
)
}

export default Settings
