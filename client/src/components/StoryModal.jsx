/* eslint-disable no-unused-vars */
import { ArrowLeft, Sparkle, Text, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

const StoryModal = ({ setShowModal, fetchStories }) => {
  const user = JSON.parse(localStorage.getItem('nexora_user'))
  const bgColors = ["#4f46e5", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"]

  const [mode, setMode] = useState("text")
  const [background, setBackground] = useState(bgColors[0])
  const [text, setText] = useState("")
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleMediaUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setMedia(file)
    // For immediate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result); // This is the Base64 string
    };
    reader.readAsDataURL(file);
  }

  const handleCreateStory = async () => {
    if (!user) return
    setIsSaving(true)

    try {
      const storyData = {
        userId: user._id,
        // We send the Base64 string (previewUrl) directly to MongoDB for now
        mediaUrl: previewUrl || '', 
        mediaType: mode === 'media' ? (media?.type.startsWith('video') ? 'video' : 'image') : 'text',
        content: text,
        backgroundColor: background
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/stories/create`, storyData)
      
      toast.success('Story shared! ✨')
      setShowModal(false)
      if (fetchStories) fetchStories()
    } catch (err) {
      console.error('Error creating story:', err)
      toast.error('Failed to share story. (File might be too large for local DB)')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[2000] min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4 animate-fade-in overflow-y-auto'>
      <div className='w-full max-w-md my-auto'>
        <div className='text-center mb-4 flex items-center justify-between'>
          <button onClick={()=> setShowModal(false)} className='text-white p-2 cursor-pointer hover:bg-white/10 rounded-full transition-all'>
            <ArrowLeft />
          </button>
          <h2 className='text-lg font-bold'>Create Story</h2>
          <span className="w-10"></span>
        </div>

        <div className='rounded-2xl h-[500px] flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/10' style={{backgroundColor: background}}> 
          
          {mode === 'text' && (
              <textarea 
                className='bg-transparent text-white w-full h-full p-8 text-xl font-bold text-center flex items-center justify-center resize-none focus:outline-none placeholder:text-white/50' 
                placeholder="What's on your mind?" 
                onChange={(e)=>setText(e.target.value)} 
                value={text}
              />
          )}
          {
              mode === 'media' && previewUrl && (
                  media?.type.startsWith('image') ? (
                    <img src={previewUrl} alt="" className='object-cover w-full h-full' />
                  ) : (
                    <video src={previewUrl} className='object-cover w-full h-full' autoPlay muted loop />
                  )
              )
          }
          {!previewUrl && mode === 'media' && (
             <div className='text-center space-y-2 opacity-50'>
                <Upload size={40} className='mx-auto' />
                <p className='text-sm font-bold'>Choose a photo or video</p>
             </div>
          )}
        </div>

        <div className='flex mt-6 gap-3 justify-center'>
          {bgColors.map((color)=>(
             <button 
               key={color} 
               className={`w-8 h-8 rounded-full cursor-pointer transition-all ${background === color ? 'ring-4 ring-white scale-110' : 'hover:scale-105'}`} 
               style={{backgroundColor: color}} 
               onClick={()=>setBackground(color)}
             />
          ))}
        </div>

        <div className='flex gap-4 mt-8'>
           <button onClick={()=> {setMode('text'); setMedia(null); setPreviewUrl(null)}} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'text' ? "bg-white text-black scale-105 shadow-lg" : "bg-zinc-800 text-gray-400"}`}>
              <Text size={18} /> Text
           </button>
           <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold cursor-pointer transition-all ${mode === 'media' ? "bg-white text-black scale-105 shadow-lg" : "bg-zinc-800 text-gray-400"}`}>
              <input onChange={(e)=>{handleMediaUpload(e); setMode('media')}} type="file" accept='image/*, video/*' className='hidden'/>
              <Upload size={18} /> Media
           </label>
       </div>

       <button 
         onClick={handleCreateStory} 
         disabled={isSaving || (mode === 'text' && !text.trim()) || (mode === 'media' && !media)}
         className={`flex items-center justify-center gap-2 text-white py-4 mt-6 w-full rounded-2xl font-bold shadow-lg transition-all ${
           isSaving ? 'bg-zinc-700 opacity-50' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-95'
         }`}
       >
          {isSaving ? (
             <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : (
             <>
               <Sparkle size={18}/> 
               <span>Share Story</span>
             </>
          )}
       </button>
      </div>
    </div>
  )
}

export default StoryModal