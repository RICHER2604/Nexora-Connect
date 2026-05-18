import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Video, MoreHorizontal, Send, Smile, Paperclip, CheckCheck } from 'lucide-react'
import axios from 'axios'
import Loading from '../components/Loading'
import moment from 'moment'
import { io } from 'socket.io-client'
import EmojiPicker from 'emoji-picker-react'

const ChatBox = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('nexora_user'))
  const scrollRef = useRef()
  const socket = useRef()

  const [targetUser, setTargetUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [arrivalMessage, setArrivalMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef()

  // Socket setup
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL)
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      })
    })

    return () => {
      socket.current.disconnect()
    }
  }, [])

  useEffect(() => {
    if (arrivalMessage && arrivalMessage.sender === userId) {
      setMessages((prev) => [...prev, arrivalMessage])
    }
  }, [arrivalMessage, userId])

  useEffect(() => {
    if (currentUser?._id) {
      socket.current.emit('addUser', currentUser._id)
    }
  }, [currentUser])

  const fetchData = async () => {
    try {
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`)
      setTargetUser(userRes.data)

      const msgRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${currentUser._id}/${userId}`)
      setMessages(msgRes.data)
    } catch (err) {
      console.error('Error fetching chat data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msgData = {
      sender: currentUser._id,
      receiver: userId,
      text: newMessage
    }

    // Emit socket event
    socket.current.emit('sendMessage', {
      senderId: currentUser._id,
      receiverId: userId,
      text: newMessage,
    })

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/send`, msgData)
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji)
  }

  // Handle outside click for emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return <Loading />

  return (
    <div className='flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white sm:rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in'>
      {/* Chat Header */}
      <div className='p-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10'>
         <div className='flex items-center gap-4'>
            <button onClick={() => navigate(-1)} className='p-2 hover:bg-slate-50 rounded-full transition-all sm:hidden'>
               <ArrowLeft size={20} className='text-gray-600' />
            </button>
            <div onClick={() => navigate(`/profile/${userId}`)} className='relative cursor-pointer group/avatar'>
               <img 
                 src={targetUser?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                 alt='' 
                 className='w-11 h-11 rounded-2xl object-cover shadow-sm' 
               />
               <div className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full' />
            </div>
            <div>
               <h3 onClick={() => navigate(`/profile/${userId}`)} className='font-bold text-gray-800 text-sm cursor-pointer hover:text-indigo-600 transition-colors'>{targetUser?.fullName}</h3>
               <p className='text-[10px] text-green-500 font-bold'>Online</p>
            </div>
         </div>
         <div className='flex items-center gap-2'>
            <button className='p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all'>
               <Phone size={20} />
            </button>
            <button className='p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all'>
               <Video size={20} />
            </button>
            <button className='p-2.5 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-xl transition-all'>
               <MoreHorizontal size={20} />
            </button>
         </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 no-scrollbar'>
         {messages.map((msg, idx) => {
            const msgSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
            const isMe = msgSenderId === currentUser._id
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] space-y-1`}>
                    <div className={`p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-slate-100'}`}>
                       {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 text-[9px] font-bold text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <span>{moment(msg.createdAt).format('HH:mm')}</span>
                       {isMe && <CheckCheck size={12} className='text-indigo-500' />}
                    </div>
                 </div>
              </div>
            )
         })}
         <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className='p-4 bg-white border-t border-slate-50 flex items-center gap-3'>
         <div className='flex items-center gap-1'>
            <button type='button' className='p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all'>
               <Paperclip size={20} />
            </button>
            <div className='relative' ref={emojiPickerRef}>
               <button 
                type='button' 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl transition-all ${showEmojiPicker ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
               >
                  <Smile size={20} />
               </button>
               {showEmojiPicker && (
                 <div className='absolute bottom-14 left-0 z-50 shadow-2xl animate-slide-up'>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      theme='light'
                      width={300}
                      height={400}
                    />
                 </div>
               )}
            </div>
         </div>
         <div className='flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white transition-all'>
            <input 
              type='text' 
              placeholder='Type a message...' 
              className='w-full bg-transparent outline-none text-sm text-gray-700'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
         </div>
         <button 
           type='submit'
           disabled={!newMessage.trim()}
           className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${newMessage.trim() ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-slate-100 text-gray-300'}`}
         >
            <Send size={20} />
         </button>
      </form>
    </div>
  )
}

export default ChatBox