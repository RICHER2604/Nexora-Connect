import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Edit, Grid, UserPlus, UserMinus, Send } from 'lucide-react'
import axios from 'axios'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import moment from 'moment'
import toast from 'react-hot-toast'
import { useLanguage } from '../utils/LanguageContext'
import { ArrowLeft } from 'lucide-react'

const Profile = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const currentUser = JSON.parse(localStorage.getItem('nexora_user'))
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  const targetId = profileId || currentUser?._id

  const fetchProfile = async () => {
    try {
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${targetId}`)
      setUser(userRes.data)

      const postsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${targetId}`)
      setPosts(postsRes.data)
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/toggle`, {
        currentUserId: currentUser._id,
        targetUserId: targetId
      })
      toast.success('Connection updated!')
      fetchProfile()
    } catch (err) {
      console.error('Follow error:', err)
      toast.error('Failed to update connection.')
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [targetId])

  if (loading) return <Loading />
  if (!user) return <div className='p-10 text-center'>User not found</div>

  const isFollowing = user.followers?.some(f => f._id === currentUser?._id || f === currentUser?._id)

  return (
    <div className='max-w-4xl mx-auto pb-20'>
      {/* Cover Photo */}
      <div className='relative h-48 sm:h-64 rounded-b-3xl overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'>
         <img 
           src={user.coverPic || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'} 
           alt='' 
           className='w-full h-full object-cover opacity-60' 
         />
         <button 
           onClick={() => navigate(-1)}
           className='absolute top-6 left-6 p-2.5 bg-black/20 backdrop-blur-md text-white rounded-xl hover:bg-black/40 transition-all active:scale-90 z-20'
         >
            <ArrowLeft size={20} />
         </button>
      </div>

      {/* Profile Info */}
      <div className='px-6 -mt-16 sm:-mt-20 relative z-10'>
         <div className='bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-50 dark:border-slate-800'>
            <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
               <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4'>
                  <img 
                    src={user.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                    alt='' 
                    className='w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900' 
                  />
                  <div className='text-center sm:text-left mb-2'>
                     <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>{user.fullName}</h1>
                     <p className='text-gray-500 dark:text-gray-400 font-medium'>@{user.username}</p>
                  </div>
               </div>
               
               {targetId === currentUser?._id ? (
                 <button 
                  onClick={() => navigate('/settings')}
                  className='flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95'
                 >
                    <Edit size={16} /> {t('edit_profile')}
                 </button>
               ) : (
                 <div className='flex items-center gap-2'>
                    <button 
                      onClick={() => navigate(`/messages/${targetId}`)}
                      className='flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95'
                    >
                       <Send size={16} /> Message
                    </button>
                    <button 
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                        isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                       {isFollowing ? (
                         <>
                           <UserMinus size={16} /> Unfollow
                         </>
                       ) : (
                         <>
                           <UserPlus size={16} /> Follow
                         </>
                       )}
                    </button>
                 </div>
               )}
            </div>

            <div className='mt-6 space-y-4'>
               <p className='text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl'>
                  {user.bio || "No bio yet."}
               </p>
               
               <div className='flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium'>
                  <div className='flex items-center gap-1'>
                     <MapPin size={16} className='text-gray-400' />
                     <span>{user.location || 'Everywhere'}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                     <Calendar size={16} className='text-gray-400' />
                     <span>Joined {moment(user.createdAt).format('MMMM YYYY')}</span>
                  </div>
               </div>

               <div className='flex gap-8 pt-4 border-t border-slate-50 dark:border-slate-800'>
                  <div className='text-center'>
                     <p className='text-lg font-bold text-gray-800 dark:text-white'>{posts.length}</p>
                     <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold'>{t('post')}</p>
                  </div>
                  <div className='text-center'>
                     <p className='text-lg font-bold text-gray-800 dark:text-white'>{user.followers?.length || 0}</p>
                     <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold'>{t('friends')}</p>
                  </div>
                  <div className='text-center'>
                     <p className='text-lg font-bold text-gray-800 dark:text-white'>{user.following?.length || 0}</p>
                     <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold'>{t('explore')}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className='mt-8 px-6'>
         <div className='flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-6'>
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${activeTab === 'posts' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
            >
               <Grid size={18} /> Posts
               {activeTab === 'posts' && <div className='absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400' />}
            </button>
         </div>

         {/* Content Grid */}
         <div className='space-y-6'>
            {posts.map((post) => (
               <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
               <div className='text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800'>
                 <Grid size={48} className='mx-auto text-slate-100 dark:text-slate-800 mb-4' />
                 <p className='text-gray-400 dark:text-gray-500 font-medium'>No posts yet.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}

export default Profile