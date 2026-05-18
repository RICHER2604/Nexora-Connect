import React, { useState, useEffect } from 'react'
import { Search, Edit, MoreHorizontal, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loading from '../components/Loading'
import moment from 'moment'

const Messages = () => {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('nexora_user'))
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchConversations = async () => {
    if (!currentUser) return
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${currentUser._id}`)
      setConversations(res.data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  return (
    <div className='max-w-2xl mx-auto py-6 px-4'>
      <div className='flex items-center justify-between mb-8'>
         <div>
            <h1 className='text-2xl font-bold text-gray-800'>Messages</h1>
            <p className='text-sm text-gray-500'>Your private conversations</p>
         </div>
         <div className='p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 cursor-pointer hover:bg-indigo-700 transition-all active:scale-95'>
            <Edit size={20} />
         </div>
      </div>

      <div className='relative mb-6'>
         <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
         <input 
           type='text' 
           placeholder='Search conversations...' 
           className='w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm focus:border-indigo-300 transition-all'
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
      </div>

      {loading ? <Loading /> : (
        <div className='space-y-2'>
           {conversations.map((chat, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(`/messages/${chat.participant._id}`)}
                className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group'
              >
                 <div className='flex items-center gap-4 flex-1 min-w-0'>
                    <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${chat.participant._id}`) }} className='relative flex-shrink-0 cursor-pointer group/avatar'>
                       <img 
                         src={chat.participant.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                         alt='' 
                         className='w-14 h-14 rounded-2xl object-cover shadow-sm' 
                       />
                       <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full' />
                    </div>
                    <div className='flex-1 min-w-0'>
                       <div className='flex items-center justify-between mb-1'>
                          <h3 onClick={(e) => { e.stopPropagation(); navigate(`/profile/${chat.participant._id}`) }} className='font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors cursor-pointer hover:underline'>{chat.participant.fullName}</h3>
                          <span className='text-[10px] font-bold text-gray-400'>{moment(chat.createdAt).fromNow()}</span>
                       </div>
                       <div className='flex items-center gap-1.5'>
                          <CheckCheck size={14} className='text-indigo-500' />
                          <p className='text-xs text-gray-500 truncate'>{chat.lastMessage}</p>
                       </div>
                    </div>
                 </div>
              </div>
           ))}

           {conversations.length === 0 && (
             <div className='text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100'>
                <p className='text-gray-400 font-medium'>No conversations yet.</p>
                <button onClick={() => navigate('/discover')} className='mt-4 text-indigo-600 font-bold hover:underline'>Find someone to chat with</button>
             </div>
           )}
        </div>
      )}
    </div>
  )
}

export default Messages