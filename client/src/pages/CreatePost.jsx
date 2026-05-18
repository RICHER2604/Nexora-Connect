import React, { useState, useRef } from 'react'
import { Image, Video, MapPin, Users, Hash, X, Send, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const CreatePost = () => {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef(null)
  const fileInputRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('nexora_user'))

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setMedia(reader.result)
    }
    reader.onerror = () => {
      toast.error('Error reading file')
    }
  }

  const onEmojiClick = (emojiObject) => {
    setContent(prev => prev + emojiObject.emoji)
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

  const handlePost = async () => {
    if (!content.trim() && !media) return
    if (!user) {
      toast.error('You must be logged in to post')
      return
    }
    
    setIsPosting(true)
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts/create`, {
        userId: user._id,
        content: content,
        imageUrls: media ? [media] : []
      })
      
      setIsPosting(false)
      toast.success('Your post is live! 🚀')
      navigate('/')
    } catch (err) {
      console.error('Error creating post:', err)
      toast.error('Failed to create post.')
      setIsPosting(false)
    }
  }

  return (
    <div className='py-6 max-w-2xl mx-auto animate-fade-in'>
      <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
        {/* Header */}
        <div className='p-4 border-b flex items-center justify-between'>
           <h1 className='text-lg font-bold text-gray-800'>Create Post</h1>
           <X 
             className='w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600' 
             onClick={() => navigate(-1)} 
           />
        </div>

        {/* User Info */}
        <div className='p-4 flex items-center gap-3'>
           <img src={user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt='' className='w-10 h-10 rounded-full object-cover shadow-sm' />
           <div>
              <p className='font-bold text-gray-800 text-sm'>{user?.fullName || 'Connecting...'}</p>
              <div className='flex gap-2 mt-1'>
                 <span className='text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-gray-500'>Public</span>
                 <span className='text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-gray-500'>Followers</span>
              </div>
           </div>
        </div>

        {/* Input Area */}
        <div className='px-4 pb-4'>
           <textarea 
             placeholder="What's happening in your Nexora Connect world?" 
             className='w-full min-h-[200px] bg-transparent outline-none text-lg resize-none text-gray-800 placeholder:text-gray-300'
             value={content}
             onChange={(e) => setContent(e.target.value)}
           ></textarea>

           {/* Media Preview */}
           {media && (
             <div className='relative mt-2 rounded-xl overflow-hidden bg-black/5'>
               <button 
                 onClick={() => setMedia(null)}
                 className='absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10'
               >
                 <X size={16} />
               </button>
               {media.startsWith('data:video') ? (
                 <video src={media} controls className='w-full max-h-96 object-contain rounded-xl' />
               ) : (
                 <img src={media} alt='Preview' className='w-full max-h-96 object-contain rounded-xl' />
               )}
             </div>
           )}
        </div>

        {/* Options */}
        <div className='p-4 border-t border-slate-50 space-y-4'>
           <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Add to your post</p>
           <input 
              type='file' 
              hidden 
              ref={fileInputRef} 
              accept='image/*,video/*' 
              onChange={handleFileChange} 
           />
           <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors group'
              >
                 <Image className='w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform' />
                 <span className='text-xs font-bold text-gray-600'>Photo</span>
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors group'
              >
                 <Video className='w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform' />
                 <span className='text-xs font-bold text-gray-600'>Video</span>
              </div>
              <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors group'>
                 <Users className='w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform' />
                 <span className='text-xs font-bold text-gray-600'>Tag</span>
              </div>
              <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors group'>
                 <MapPin className='w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform' />
                 <span className='text-xs font-bold text-gray-600'>Location</span>
              </div>
              <div className='relative' ref={emojiPickerRef}>
                  <div 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${showEmojiPicker ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-indigo-50 group'}`}
                  >
                     <Smile className={`w-5 h-5 ${showEmojiPicker ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
                     <span className={`text-xs font-bold ${showEmojiPicker ? 'text-white' : 'text-gray-600'}`}>Emoji</span>
                  </div>
                  {showEmojiPicker && (
                    <div className='absolute bottom-16 left-0 z-50 shadow-2xl animate-slide-up'>
                       <EmojiPicker 
                         onEmojiClick={onEmojiClick} 
                         theme='light'
                         width={280}
                         height={350}
                       />
                    </div>
                  )}
              </div>
           </div>
        </div>

        {/* Submit */}
        <div className='p-4 bg-slate-50/50'>
           <button 
             onClick={handlePost}
             disabled={(!content.trim() && !media) || isPosting || !user}
             className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
               (content.trim() || media) && !isPosting && user
               ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]' 
               : 'bg-slate-200 text-gray-400 cursor-not-allowed shadow-none'
             }`}
           >
              {isPosting ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <>
                  <span>Post to Feed</span>
                  <Send className='w-4 h-4' />
                </>
              )}
           </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePost