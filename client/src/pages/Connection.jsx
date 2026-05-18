import React, { useState, useEffect } from 'react'
import { Users, UserPlus, MessageCircle, MoreVertical, Search } from 'lucide-react'
import axios from 'axios'
import Loading from '../components/Loading'
import { useNavigate } from 'react-router-dom'

const Connection = () => {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('nexora_user'))
  const [activeTab, setActiveTab] = useState('followers')
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConnections = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      // For this full-stack version, we'll fetch the user and populate followers/following
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${currentUser._id}`)
      const userData = res.data
      
      // Usually you'd have a specific endpoint for followers list with population
      // This is a simplified fetch
      if (activeTab === 'followers') {
        setConnections(userData.followers || [])
      } else {
        setConnections(userData.following || [])
      }
    } catch (err) {
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [activeTab])

  return (
    <div className='py-6 max-w-4xl mx-auto px-4'>
      <div className='flex items-center justify-between mb-8'>
         <div>
            <h1 className='text-2xl font-bold text-gray-800'>Connections</h1>
            <p className='text-sm text-gray-500'>People you are connected with on Nexora Connect</p>
         </div>
         <button 
           onClick={() => navigate('/discover')}
           className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95'
         >
           Find People
         </button>
      </div>

      {/* Tabs */}
      <div className='flex gap-4 mb-6 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit'>
         <button 
           onClick={() => setActiveTab('followers')}
           className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'followers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-slate-50'}`}
         >
           Followers
         </button>
         <button 
           onClick={() => setActiveTab('following')}
           className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-slate-50'}`}
         >
           Following
         </button>
      </div>

      {loading ? <Loading /> : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
           {connections.map((person) => (
              <div key={person._id} className='bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-100 transition-all group'>
                 <div onClick={() => navigate(`/profile/${person._id}`)} className='flex items-center gap-4 cursor-pointer'>
                    <img 
                      src={person.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                      alt='' 
                      className='w-14 h-14 rounded-2xl object-cover border border-slate-50' 
                    />
                    <div>
                       <h3 className='font-bold text-gray-800 group-hover:text-indigo-600 transition-colors'>{person.fullName}</h3>
                       <p className='text-xs text-gray-500'>@{person.username}</p>
                    </div>
                 </div>
                 <div className='flex items-center gap-2'>
                    <button 
                      onClick={() => navigate(`/messages/${person._id}`)}
                      className='p-2.5 bg-slate-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all'
                    >
                       <MessageCircle size={18} />
                    </button>
                    <button className='p-2.5 bg-slate-50 text-gray-400 hover:bg-slate-100 rounded-xl transition-all'>
                       <MoreVertical size={18} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {!loading && connections.length === 0 && (
        <div className='text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100'>
           <Users className='w-12 h-12 text-slate-100 mx-auto mb-4' />
           <p className='text-gray-400 font-medium'>You don't have any {activeTab} yet.</p>
           <button onClick={() => navigate('/discover')} className='mt-4 text-indigo-600 font-bold hover:underline'>Discover people</button>
        </div>
      )}
    </div>
  )
}

export default Connection