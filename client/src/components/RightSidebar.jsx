/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { MoreHorizontal, TrendingUp, Newspaper, UserPlus, UserMinus, X, ExternalLink, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const RightSidebar = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('nexora_user')))
  const [suggestions, setSuggestions] = useState([])
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)

  const fetchSuggestions = async () => {
    if (!currentUser) return
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/suggested/${currentUser._id}`)
      setSuggestions(res.data.slice(0, 3))
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  const fetchNews = async () => {
    setLoadingNews(true)
    try {
      // We'll create this endpoint in the backend
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`)
      setNews(res.data.slice(0, 5))
    } catch (err) {
      console.error('Error fetching news:', err)
      // Fallback news if API fails
      setNews([
        { title: "India launches next-generation green energy initiative", source: "The Hindu", time: "1h ago", url: "https://www.thehindu.com" },
        { title: "BCCI announces squad for upcoming bilateral series", source: "NDTV Sports", time: "3h ago", url: "https://sports.ndtv.com" },
        { title: "Tech hubs in Bengaluru and Hyderabad see record expansion", source: "Times of India", time: "6h ago", url: "https://timesofindia.indiatimes.com" },
        { title: "Nexora Connect user base grows across Indian universities", source: "Nexora Blog", time: "1d ago", url: "https://nexoraconnect.com" }
      ])
    } finally {
      setLoadingNews(false)
    }
  }

  const handleFollow = async (targetId) => {
    if (!currentUser) return
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/toggle`, {
        currentUserId: currentUser._id,
        targetUserId: targetId
      })
      
      if (res.data.user) {
        localStorage.setItem('nexora_user', JSON.stringify(res.data.user))
        setCurrentUser(res.data.user)
        toast.success(res.data.message || 'Updated connection!')
      }
    } catch (err) {
      toast.error('Failed to update connection.')
    }
  }

  useEffect(() => {
    fetchSuggestions()
    fetchNews()
  }, [])

  return (
    <div className='hidden lg:flex flex-col gap-6 p-4 w-[300px] sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar'>
      
      {/* Sponsored Section */}
      <div className='p-5 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 group'>
        <div className='flex items-center justify-between text-gray-400 font-bold text-[10px] uppercase tracking-[0.1em] mb-4'>
          <span>Sponsored</span>
          <MoreHorizontal className='w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' />
        </div>
        <div className='relative overflow-hidden rounded-2xl mb-4'>
          <img src={assets.sponsored_img || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg'} alt='' className='h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>
        <div className='flex items-center gap-2 mb-2'>
           <img src={assets.logo} alt='' className='w-5 h-5 object-contain' />
           <span className='text-indigo-600 dark:text-indigo-400 font-black text-[11px] tracking-tight uppercase'>Nexora Connect+</span>
        </div>
        <p className='text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>Unlock advanced analytics and global reach with Nexora Connect+. Boost your career visibility today.</p>
        <button className='w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-2.5 rounded-xl text-xs font-black mt-4 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all duration-300'>Join Pro</button>
      </div>

      {/* Live India News Section */}
      <div className='p-5 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800'>
        <div className='flex items-center justify-between mb-5'>
           <div className='flex items-center gap-2'>
              <div className='p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg'>
                <Newspaper className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
              </div>
              <span className='font-black text-gray-800 dark:text-white text-sm tracking-tight'>Live India News</span>
           </div>
           <TrendingUp className='w-4 h-4 text-emerald-500 animate-pulse' />
        </div>
        
        <div className='flex flex-col gap-5'>
           {loadingNews ? (
             <div className='flex flex-col gap-4 py-2'>
                {[1,2,3].map(i => (
                  <div key={i} className='animate-pulse space-y-2'>
                     <div className='h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4' />
                     <div className='h-2 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/2' />
                  </div>
                ))}
             </div>
           ) : (
             news.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => item.url && window.open(item.url, '_self')}
                  className='group cursor-pointer relative pr-4 hover:translate-x-0.5 transition-transform duration-200'
                >
                   <h4 className='text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2'>
                     {item.title}
                   </h4>
                   <div className='flex items-center gap-2 mt-1.5'>
                     <p className='text-[9px] font-black text-indigo-400 uppercase tracking-widest'>{item.source || 'India News'}</p>
                     <span className='w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full' />
                     <p className='text-[9px] text-gray-400 font-medium'>{item.time || 'Recently'}</p>
                   </div>
                   <ExternalLink size={10} className='absolute top-0.5 right-0 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity' />
                </div>
              ))
           )}
        </div>

        <button 
          onClick={() => fetchNews()}
          className='w-full mt-6 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest py-3 border border-indigo-50 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all active:scale-[0.98]'
        >
           {loadingNews ? <Loader2 size={14} className='mx-auto animate-spin' /> : 'Refresh News'}
        </button>
      </div>

      {/* Suggested Connections */}
      <div className='p-5 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800'>
        <div className='flex items-center justify-between text-gray-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-5'>
          <span>People you may know</span>
          <span onClick={() => navigate('/discover')} className='text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline'>See All</span>
        </div>
        <div className='flex flex-col gap-4'>
           {suggestions.length > 0 ? (
             suggestions.map((user) => (
               <div key={user._id} className='flex items-center justify-between group/user'>
                  <div onClick={() => navigate(`/profile/${user._id}`)} className='flex items-center gap-3 cursor-pointer'>
                     <img src={user.profilePic || user.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt='' className='w-10 h-10 rounded-full object-cover shadow-sm group-hover/user:ring-2 group-hover/user:ring-indigo-100 dark:group-hover/user:ring-indigo-900/50 transition-all' />
                     <div className='min-w-0'>
                        <span className='font-bold text-gray-800 dark:text-gray-200 text-xs block truncate w-24'>{user.fullName || user.full_name}</span>
                        <p className='text-[10px] text-gray-400 font-medium'>@{user.username}</p>
                     </div>
                  </div>
                  <div className='flex gap-1.5'>
                     <button 
                       onClick={() => handleFollow(user._id)}
                       className={`p-2 rounded-xl transition-all duration-300 ${
                         currentUser?.following?.includes(user._id)
                         ? 'bg-slate-100 dark:bg-slate-800 text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500'
                         : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none'
                       }`}
                     >
                        {currentUser?.following?.includes(user._id) ? <UserMinus size={14} /> : <UserPlus size={14} />}
                     </button>
                  </div>
               </div>
             ))
           ) : (
             <p className='text-[10px] text-gray-400 dark:text-gray-500 text-center py-4'>No suggestions available</p>
           )}
        </div>
      </div>

    </div>
  )
}

export default RightSidebar

