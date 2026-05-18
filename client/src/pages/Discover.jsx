import React, { useState, useEffect } from 'react'
import { Search, UserPlus, UserMinus, ShieldCheck, Send } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

const Discover = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qParam = searchParams.get('q') || ''

  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('nexora_user')))
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(qParam)

  const fetchSuggested = async () => {
    if (!currentUser) return
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/suggested/${currentUser._id}`)
      setUsers(res.data)
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 2) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/search?query=${q}`)
        setUsers(res.data)
      } catch (err) {
        console.error('Search error:', err)
      }
    } else if (q.length === 0) {
      fetchSuggested()
    }
  }

  const handleFollow = async (targetId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/toggle`, {
        currentUserId: currentUser._id,
        targetUserId: targetId
      })
      
      // Update local storage and state with the updated user returned from backend
      if (res.data.user) {
        localStorage.setItem('nexora_user', JSON.stringify(res.data.user))
        setCurrentUser(res.data.user)
      }
      
      toast.success(res.data.message || 'Successfully updated connection!')
      // Optional: refresh suggested if we want to remove the user from the list
      // fetchSuggested()
    } catch (err) {
      console.error('Follow error:', err)
      toast.error('Failed to update connection.')
    }
  }

  useEffect(() => {
    if (qParam) {
      setSearchQuery(qParam)
      const fetchSearchResults = async () => {
        setLoading(true)
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/search?query=${qParam}`)
          setUsers(res.data)
        } catch (err) {
          console.error('Search error:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchSearchResults()
    } else {
      setSearchQuery('')
      fetchSuggested()
    }
  }, [qParam])


  return (
    <div className='py-6 max-w-4xl mx-auto px-4 sm:px-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
         <div>
            <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Discover People</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Find and connect with people globally on Nexora Connect</p>
         </div>
         <div className='relative group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors' />
            <input 
              type='text' 
              placeholder='Search by name or username...' 
              className='pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none w-full md:w-64 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 dark:text-white transition-all'
              value={searchQuery}
              onChange={handleSearch}
            />
         </div>
      </div>

      {loading ? <Loading /> : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
           {users.map((user) => (
              <div key={user._id} className='bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group'>
                 <div className='relative flex flex-col items-center text-center'>
                    <div className='relative cursor-pointer' onClick={() => navigate(`/profile/${user._id}`)}>
                       <img 
                         src={user.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                         alt='' 
                         className='w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform' 
                       />
                       <div className='absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full' />
                    </div>
                    
                    <div className='mt-4 cursor-pointer' onClick={() => navigate(`/profile/${user._id}`)}>
                       <div className='flex items-center justify-center gap-1'>
                          <h2 className='font-bold text-gray-800 dark:text-white'>{user.fullName}</h2>
                          <ShieldCheck className='w-4 h-4 text-blue-500' />
                       </div>
                       <p className='text-xs text-gray-500 dark:text-gray-400'>@{user.username}</p>
                    </div>

                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-3 line-clamp-2 italic'>
                       {user.bio || "Hello! I'm using Nexora Connect 🚀"}
                    </p>

                    <div className='flex gap-3 mt-4 w-full'>
                       <button 
                         onClick={() => handleFollow(user._id)}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                           currentUser.following.includes(user._id)
                           ? 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600'
                           : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none'
                         }`}
                       >
                          {currentUser.following.includes(user._id) ? (
                            <>
                              <UserMinus className='w-3 h-3' />
                              <span>Unfollow</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className='w-3 h-3' />
                              <span>Follow</span>
                            </>
                          )}
                       </button>
                       <button 
                         onClick={() => navigate(`/messages/${user._id}`)}
                         className='p-2 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all border border-slate-100 dark:border-slate-700'
                       >
                          <Send size={16} />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className='text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800'>
           <Search className='w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4' />
           <p className='text-gray-500 dark:text-gray-400 font-medium'>No users found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default Discover