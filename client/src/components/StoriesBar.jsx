/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyStoriesData } from '../assets/assets'
import { Plus } from 'lucide-react'
import moment from 'moment'
import axios from 'axios'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'

const StoriesBar = () => {
  const [stories, setStories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [viewIndex, setViewIndex] = useState(null)
  const navigate = useNavigate()

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stories`)
      setStories(res.data.length > 0 ? res.data : dummyStoriesData)
    } catch (err) {
      console.error('Error fetching stories:', err)
      setStories(dummyStoriesData)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return (
    <>
      <div className='w-full no-scrollbar overflow-x-auto pb-4'>
        <div className='flex gap-3'>
          {/* Add Story Card */}
          <div 
            onClick={() => setShowModal(true)} 
            className='rounded-2xl shadow-sm min-w-[110px] h-[170px] cursor-pointer hover:shadow-md transition-all duration-300 border-2 border-dashed border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-900 group flex flex-col items-center justify-center relative overflow-hidden'
          >
            <div className='absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-slate-800/50 transition-colors z-0' />
            <div className='w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-active:scale-95 transition-all z-10 shadow-md'>
              <Plus className='w-6 h-6 text-white' />
            </div>
            <p className='text-xs font-bold text-gray-700 dark:text-gray-300 text-center z-10'>Create Story</p>
          </div>

          {/* Story Cards */}
          {stories?.map((story, index) => (
            <div 
              onClick={() => setViewIndex(index)} 
              key={story._id || index} 
              className='relative rounded-2xl shadow-sm min-w-[110px] h-[170px] cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group bg-indigo-900 border border-slate-100 dark:border-slate-800'
            >
              {/* Gradient Overlay */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 group-hover:from-black/90 transition-all' />
              
              {/* User Profile Pic */}
                <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${story.user?._id}`) }} className='absolute w-10 h-10 top-3 left-3 z-20 rounded-full border-2 border-indigo-600 p-0.5 group-hover:scale-110 transition-transform'>
                  <img src={story.user?.profilePic || story.user?.profile_picture} alt="" className='w-full h-full rounded-full object-cover'/>
              </div>
              
              {/* Story Media */}
              <div className='absolute inset-0 z-0'>
                  {story.mediaType === 'image' || story.media_type === 'image' ? (
                    <img src={story.mediaUrl || story.media_url} alt="" className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90' />
                  ) : story.mediaType === 'video' || story.media_type === 'video' ? (
                    <video src={story.mediaUrl || story.media_url} className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90' />
                  ) : (
                    <div style={{ backgroundColor: story.backgroundColor || story.background_color }} className='w-full h-full flex items-center justify-center p-4 text-center text-xs text-white font-bold group-hover:scale-105 transition-transform'>
                      {story.content}
                    </div>
                  )}
              </div>

              {/* User Name & Time */}
              <div className='absolute bottom-3 left-3 z-20'>
                  <p className='text-white text-[10px] font-bold truncate max-w-[80px]'>{story.user?.fullName || story.user?.full_name}</p>
                  <p className='text-white/70 text-[8px] font-medium'>{moment(story.createdAt).fromNow()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories}/>} 
      {viewIndex !== null && <StoryViewer stories={stories} index={viewIndex} setIndex={setViewIndex}/>} 
    </>
  )
}

export default StoriesBar
