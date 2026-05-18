/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Terminal, Code2, Globe, Cpu, Zap, Users, MessageSquare, ExternalLink, Share2, Sparkles, BookOpen, Layers, X, Plus, Shield, Hash } from 'lucide-react'
import axios from 'axios'
import { useLanguage } from '../utils/LanguageContext'
import toast from 'react-hot-toast'

const Workplace = () => {
  const { t } = useLanguage()
  const currentUser = JSON.parse(localStorage.getItem('nexora_user'))
  const [news, setNews] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState('Global Dev')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Create Room State
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    type: 'public'
  })

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms`)
      setRooms(res.data)
      if (res.data.length > 0 && !activeRoom) {
         setActiveRoom(res.data[0].name)
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
    } finally {
      setRoomsLoading(false)
    }
  }

  const fetchDevNews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`)
      setNews(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevNews()
    fetchRooms()
  }, [])

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!currentUser) return toast.error('Please login to create a room')
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms/create`, {
        ...roomData,
        userId: currentUser._id
      })
      setRooms([res.data, ...rooms])
      setActiveRoom(res.data.name)
      setIsModalOpen(false)
      setRoomData({ name: '', description: '', type: 'public' })
      toast.success('Room created successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    }
  }

  const joinRoom = async (roomId, roomName) => {
    if (!currentUser) return toast.error('Please login to join a room')
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms/join`, {
        roomId,
        userId: currentUser._id
      })
      toast.success(`Joined ${roomName}!`)
      fetchRooms()
      setActiveRoom(roomName)
    } catch (err) {
      toast.error('Failed to join room')
    }
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-fade-in'>
      
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10'>
         <div>
            <h1 className='text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3'>
               <Sparkles className='text-indigo-500 animate-pulse' size={32} />
               Developer Workplace
            </h1>
            <p className='text-gray-500 dark:text-gray-400 font-medium mt-2'>Real-time collaboration hub for the Nexora community.</p>
         </div>
         <div className='flex items-center gap-3 bg-indigo-600 p-1 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none'>
            <button className='px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-sm'>Join Workspace</button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className='px-6 py-2.5 text-white rounded-xl text-xs font-black hover:bg-white/10 transition-colors'
            >
              Create Room
            </button>
         </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
         
         {/* Left Column: AI News Hub */}
         <div className='lg:col-span-8 space-y-8'>
            <div className='bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-50 dark:border-slate-800 relative overflow-hidden'>
               <div className='absolute top-0 right-0 p-8 opacity-5 pointer-events-none'>
                  <Globe size={160} className='text-indigo-500' />
               </div>
               
               <div className='flex items-center justify-between mb-8 relative z-10'>
                  <div className='flex items-center gap-3'>
                     <div className='p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl'>
                        <Cpu className='text-rose-500' size={24} />
                     </div>
                     <div>
                        <h2 className='text-lg font-black text-gray-800 dark:text-white leading-tight'>Real-time AI News</h2>
                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>Powered by Nexora Connect</p>
                     </div>
                  </div>
                  <button onClick={fetchDevNews} className='p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all'>
                     <Zap size={18} className='text-amber-500' />
                  </button>
               </div>

               <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10'>
                  {loading ? (
                    [1,2,3,4].map(i => (
                       <div key={i} className='animate-pulse bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-3'>
                          <div className='h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4' />
                          <div className='h-3 bg-slate-50 dark:bg-slate-700/50 rounded-full w-1/2' />
                       </div>
                    ))
                  ) : (
                    news.map((item, idx) => (
                       <div 
                        key={idx} 
                        className='p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all group cursor-pointer'
                        onClick={() => window.open(item.url, '_blank')}
                       >
                          <div className='flex items-center justify-between mb-4'>
                             <span className='px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-[10px] font-black text-indigo-500 uppercase tracking-tight shadow-sm'>
                                {item.source}
                             </span>
                             <p className='text-[10px] text-gray-400 font-bold'>{item.time}</p>
                          </div>
                          <h3 className='text-sm font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors leading-relaxed mb-4'>
                             {item.title}
                          </h3>
                          <div className='flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50'>
                             <span className='text-[10px] text-gray-400 font-medium flex items-center gap-1'>
                                <BookOpen size={12} /> Read Full Article
                             </span>
                             <Share2 size={12} className='text-gray-300 group-hover:text-indigo-400 transition-colors' />
                          </div>
                       </div>
                    ))
                  )}
               </div>
            </div>

            {/* Collaborative Tools Section */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
               {[
                 { icon: <Terminal size={24} className='text-emerald-500' />, title: 'Cloud Console', desc: 'Manage your microservices' },
                 { icon: <Code2 size={24} className='text-blue-500' />, title: 'Shared Editor', desc: 'Code together in real-time' },
                 { icon: <Layers size={24} className='text-purple-500' />, title: 'System Architecture', desc: 'Plan complex infrastructure' }
               ].map((tool, i) => (
                  <div key={i} className='p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group'>
                     <div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform'>
                        {tool.icon}
                     </div>
                     <h4 className='text-sm font-black text-gray-800 dark:text-white mb-1'>{tool.title}</h4>
                     <p className='text-xs text-gray-400 font-medium leading-relaxed'>{tool.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Column: Rooms & Community */}
         <div className='lg:col-span-4 space-y-8'>
            <div className='bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800'>
               <h2 className='text-lg font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2'>
                  <Users size={20} className='text-indigo-600' />
                  Collaboration Rooms
               </h2>
               
               <div className='space-y-4'>
                  {roomsLoading ? (
                     [1,2,3].map(i => (
                        <div key={i} className='h-20 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl' />
                     ))
                  ) : (
                     rooms.map((room, i) => {
                        const isMember = room.members?.some(m => m._id === currentUser?._id)
                        return (
                           <div 
                            key={i} 
                            onClick={() => isMember ? setActiveRoom(room.name) : joinRoom(room._id, room.name)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${activeRoom === room.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-gray-800 dark:text-gray-300 hover:border-indigo-100'}`}
                           >
                           <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center gap-2'>
                                 {room.type === 'private' ? <Shield size={12} /> : <Hash size={12} />}
                                 <span className='text-xs font-black tracking-tight'>{room.name}</span>
                              </div>
                              <div className={`size-2 rounded-full ${activeRoom === room.name ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                           </div>
                           <div className='flex items-center justify-between'>
                              <div className='flex -space-x-2'>
                                 {room.members?.slice(0, 3).map((m, idx) => (
                                   <img key={idx} src={m.profilePic || `https://randomuser.me/api/portraits/thumb/men/${idx + 10}.jpg`} className='size-5 rounded-full border border-white dark:border-slate-900 object-cover' alt='' />
                                 ))}
                                 {room.members?.length > 3 && (
                                    <div className='size-5 rounded-full bg-indigo-400/20 flex items-center justify-center text-[8px] font-bold'>+{room.members.length - 3}</div>
                                 )}
                                 {(!room.members || room.members.length === 0) && (
                                    <div className='size-5 rounded-full bg-indigo-400/20 flex items-center justify-center text-[8px] font-bold'>0</div>
                                 )}
                              </div>
                              <MessageSquare size={14} className='opacity-40' />
                           </div>
                        </div>
                     )
                  })
               )}

                  {!roomsLoading && rooms.length === 0 && (
                     <div className='text-center py-8'>
                        <p className='text-xs text-gray-400 font-medium'>No rooms found.</p>
                        <button onClick={() => setIsModalOpen(true)} className='text-xs text-indigo-600 font-bold mt-2 hover:underline'>Create the first one</button>
                     </div>
                  )}
               </div>
            </div>

            <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden'>
               <div className='absolute -bottom-6 -right-6 opacity-10'>
                  <Sparkles size={120} />
               </div>
               <h3 className='text-xl font-black mb-2'>Nexora AI Assistant</h3>
               <p className='text-xs text-white/70 font-medium leading-relaxed mb-6'>Need help with your code? Our built-in AI assistant is ready to help you debug and optimize your projects.</p>
               <button className='px-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all'>Open AI Debugger</button>
            </div>
         </div>

      </div>

      {/* Create Room Modal */}
      {isModalOpen && (
         <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
            <div className='bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-scale-in'>
               <div className='p-8'>
                  <div className='flex items-center justify-between mb-8'>
                     <div className='flex items-center gap-3'>
                        <div className='p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl'>
                           <Plus className='text-indigo-600' size={24} />
                        </div>
                        <div>
                           <h2 className='text-xl font-black text-gray-800 dark:text-white'>Create Room</h2>
                           <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>Start a new collaboration</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setIsModalOpen(false)}
                        className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all'
                     >
                        <X size={20} className='text-gray-400' />
                     </button>
                  </div>

                  <form onSubmit={handleCreateRoom} className='space-y-6'>
                     <div className='space-y-2'>
                        <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Room Name</label>
                        <input 
                           required
                           type='text'
                           placeholder='e.g. Backend Wizards'
                           className='w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-gray-800 dark:text-white font-medium transition-all'
                           value={roomData.name}
                           onChange={(e) => setRoomData({...roomData, name: e.target.value})}
                        />
                     </div>

                     <div className='space-y-2'>
                        <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Description</label>
                        <textarea 
                           placeholder='What is this room about?'
                           rows='3'
                           className='w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-gray-800 dark:text-white font-medium transition-all resize-none'
                           value={roomData.description}
                           onChange={(e) => setRoomData({...roomData, description: e.target.value})}
                        />
                     </div>

                     <div className='space-y-2'>
                        <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Room Type</label>
                        <div className='grid grid-cols-2 gap-3'>
                           {['public', 'private', 'guild', 'featured'].map((type) => (
                              <button
                                 key={type}
                                 type='button'
                                 onClick={() => setRoomData({...roomData, type})}
                                 className={`py-3 rounded-xl text-xs font-black capitalize transition-all ${roomData.type === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 dark:bg-slate-800 text-gray-500 hover:bg-slate-100'}`}
                              >
                                 {type}
                              </button>
                           ))}
                        </div>
                     </div>

                     <button 
                        type='submit'
                        className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2'
                     >
                        Create Room
                        <Zap size={18} />
                     </button>
                  </form>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

export default Workplace
