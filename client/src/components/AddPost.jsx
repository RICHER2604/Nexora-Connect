import React, { useState, useRef } from 'react'
import { Image, Video, Calendar, Smile, Send, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AddPost = ({ onPostCreated }) => {
  const [text, setText] = useState('')
  const [media, setMedia] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
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

  const handlePost = async () => {
    if (!text.trim() && !media) {
      toast.error('Please enter some text or add a media file to post!')
      return
    }

    if (!user) {
      toast.error('Still connecting to server... Please wait a second.')
      return
    }

    setIsPosting(true)
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts/create`, {
        userId: user._id,
        content: text,
        imageUrls: media ? [media] : [] 
      })
      
      setIsPosting(false)
      setText('')
      setMedia(null)
      toast.success('Post shared successfully! 🚀')
      if (onPostCreated) onPostCreated()
    } catch (err) {
      console.error('Error creating post:', err)
      toast.error('Failed to share post. Make sure the server is running.')
      setIsPosting(false)
    }
  }

  return (
    <div className='p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex flex-col gap-5 mb-6 border border-slate-100 dark:border-slate-800 animate-fade-in'>
      <div className='flex gap-4'>
        <div className='relative'>
           <img 
             src={user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
             alt='' 
             className='w-12 h-12 rounded-full object-cover shadow-sm' 
           />
           <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${user ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
        </div>
        <div className='flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 focus-within:border-indigo-200 dark:focus-within:border-indigo-500 transition-all'>
           <textarea 
             placeholder={user ? "What's happening, Nexora Connect?" : "Connecting to database..."}
             className='bg-transparent outline-none w-full text-sm resize-none h-14 p-1 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500'
             value={text}
             onChange={(e) => setText(e.target.value)}
             disabled={!user && !isPosting}
           ></textarea>
           
           {/* Media Preview */}
           {media && (
             <div className='relative mt-2 rounded-xl overflow-hidden bg-black/5 dark:bg-black/20'>
               <button 
                 onClick={() => setMedia(null)}
                 className='absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10'
               >
                 <X size={14} />
               </button>
               {media.startsWith('data:video') ? (
                 <video src={media} controls className='w-full max-h-64 object-contain rounded-xl' />
               ) : (
                 <img src={media} alt='Preview' className='w-full max-h-64 object-contain rounded-xl' />
               )}
             </div>
           )}
        </div>
      </div>

      <div className='flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4'>
         <div className='flex items-center gap-1 sm:gap-4 text-gray-500 dark:text-gray-400'>
            <input 
              type='file' 
              hidden 
              ref={fileInputRef} 
              accept='image/*,video/*' 
              onChange={handleFileChange} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all group'
            >
               <Image className='w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' />
               <span className='text-[11px] font-bold hidden sm:block'>Photo</span>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all group'
            >
               <Video className='w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' />
               <span className='text-[11px] font-bold hidden sm:block'>Video</span>
            </div>
            <div className='flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all group'>
               <Calendar className='w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' />
               <span className='text-[11px] font-bold hidden sm:block'>Event</span>
            </div>
         </div>
         
         <button 
           onClick={handlePost}
           disabled={(!text.trim() && !media) || isPosting || !user}
           className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
             (text.trim() || media) && !isPosting && user
             ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 dark:hover:shadow-none hover:scale-105 active:scale-95' 
             : 'bg-slate-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
           }`}
         >
            {isPosting ? (
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
              <>
                <span>{user ? 'Post' : 'Syncing...'}</span>
                <Send className='w-4 h-4' />
              </>
            )}
         </button>
      </div>
    </div>
  )
}

export default AddPost
