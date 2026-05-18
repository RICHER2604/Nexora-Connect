/* eslint-disable react-hooks/set-state-in-effect */

import { BadgeCheck, X, Volume2, VolumeX, Play, Pause } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const StoryViewer = ({ stories = [], index, setIndex }) => {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef(null)

  // Reset states on story change
  useEffect(() => {
    setProgress(0)
    setIsPlaying(true)
  }, [index])

  // Progress Bar timer for Images/Text
  useEffect(() => {
    let progressInterval;
    const current = stories?.[index]
    const type = current?.mediaType || current?.media_type;
    
    if (current && type !== 'video') {
      if (!isPlaying) return;

      const duration = 5000; // Instagram standard is 5 seconds for images
      const intervalTime = 30; // 33fps for buttery smooth movement
      
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (intervalTime / duration) * 100;
          if (next >= 100) {
            clearInterval(progressInterval);
            // Small timeout to let the UI render 100% before transitioning
            setTimeout(() => {
              if (index + 1 < (stories?.length || 0)) {
                setIndex(index + 1);
              } else {
                setIndex(null);
              }
            }, 50);
            return 100;
          }
          return next;
        });
      }, intervalTime);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    }
  }, [index, stories, setIndex, isPlaying])

  // Video playback controller
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.log("Video autoplay blocked/failed:", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, index])

  const handleClose = () => {
    setIndex(null)
  }

  const handleNext = () => {
    if (index + 1 < (stories?.length || 0)) setIndex(index + 1)
    else setIndex(null)
    setProgress(0)
  }

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1)
    else setIndex(null)
    setProgress(0)
  }

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  }

  const handleTap = (e) => {
    // Ignore clicks on buttons or links to avoid interfering with actions
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.user-info-header')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% goes to previous story
    if (x < width * 0.3) {
      handlePrev();
    } 
    // Right 30% goes to next story
    else if (x > width * 0.7) {
      handleNext();
    } 
    // Center 40% play/pause toggle
    else {
      setIsPlaying((prev) => !prev);
    }
  }

  const viewStory = stories?.[index]
  if (!viewStory) return null;

  const handleVideoTimeUpdate = (e) => {
    if (isPlaying) {
      const video = e.target;
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    }
  }

  const handleVideoLoadedMetadata = () => {
    setProgress(0);
  }

  const handleVideoEnded = () => {
    handleNext();
  }

  const renderContent = () => {
    const type = viewStory?.mediaType || viewStory?.media_type;
    const url = viewStory?.mediaUrl || viewStory?.media_url;
    const textContent = viewStory?.content;
    const sharedPost = viewStory?.sharedPost;
    
    if (sharedPost) {
      return (
        <div className='bg-white/10 backdrop-blur-3xl border border-white/20 p-6 rounded-[32px] w-[320px] sm:w-[380px] shadow-2xl animate-scale-up z-10'>
           <div className='flex items-center gap-3 mb-4'>
              <img 
                src={sharedPost.user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                alt='' 
                className='w-10 h-10 rounded-full object-cover border-2 border-white/50' 
              />
              <div>
                 <div className='flex items-center gap-1'>
                    <p className='text-sm font-black text-white'>{sharedPost.user?.fullName}</p>
                    <BadgeCheck size={14} className='text-blue-400 fill-blue-400/20' />
                 </div>
                 <p className='text-[10px] text-white/60 font-medium'>@{sharedPost.user?.username}</p>
              </div>
           </div>
           
           {sharedPost.imageUrls?.length > 0 && (
             <div className='aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10'>
                <img src={sharedPost.imageUrls[0]} alt='' className='w-full h-full object-cover' />
             </div>
           )}

           <p className='text-sm text-white/90 leading-relaxed line-clamp-3 font-medium'>
              {sharedPost.content}
           </p>
           
           <div className='mt-6 pt-4 border-t border-white/10 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                 <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                 <span className='text-[10px] text-white/40 font-bold uppercase tracking-widest'>Original Post</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/post/${sharedPost._id}`); setIndex(null) }}
                className='px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-white/10'
              >
                 View Post
              </button>
           </div>
        </div>
      )
    }

    switch (type) {
      case 'image':
        return (
          <img src={url} alt="" className='w-full h-full object-contain select-none pointer-events-none' />
        );

      case 'video':
        return (
          <video 
            ref={videoRef}
            src={url} 
            autoPlay 
            playsInline
            muted={isMuted}
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onEnded={handleVideoEnded}
            className='w-full h-full object-contain select-none'
          />
        );

      case 'text':
        return (
          <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center font-bold italic select-none'>
            {textContent}
          </div>
        );

      default:
         return null;
    }
  }

  const bgColor = viewStory?.backgroundColor || viewStory?.background_color || 'rgba(0,0,0,0.95)';
  const type = viewStory?.mediaType || viewStory?.media_type;

  return (
    <div 
      className='fixed inset-0 h-screen bg-black/95 z-[1000] flex items-center justify-center overflow-hidden animate-fade-in'
      style={{ backgroundColor: type === 'text' ? bgColor : 'rgba(10,10,10,0.98)' }}
    >
      {/* Blurred Backdrop (Instagram Web Style) */}
      {type !== 'text' && viewStory?.mediaUrl && (
        <div 
          className='absolute inset-0 w-full h-full scale-110 blur-3xl opacity-30 select-none pointer-events-none z-0 hidden sm:block'
          style={{
            backgroundImage: `url(${viewStory.mediaUrl || viewStory.media_url})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      {/* Story Viewer Card Container */}
      <div 
        onClick={handleTap}
        className='relative w-full max-w-[450px] h-screen sm:h-[90vh] sm:max-h-[800px] aspect-[9/16] bg-neutral-950 sm:rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl border border-white/5 z-10 select-none cursor-pointer'
      >
        {/* Render Content */}
        <div className='absolute inset-0 w-full h-full flex items-center justify-center bg-black z-10'>
          {renderContent()}
        </div>

        {/* Individual Progress Segments (Instagram Style) */}
        <div className='absolute top-3 left-3 right-3 z-50 flex gap-1.5'>
          {stories.map((story, idx) => {
            let width = '0%';
            if (idx < index) width = '100%';
            else if (idx === index) width = `${progress}%`;
            return (
              <div key={idx} className='h-1 flex-1 bg-white/20 rounded-full overflow-hidden'>
                <div 
                  className='h-full bg-white rounded-full transition-all duration-100 linear' 
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* User Info Header (Inside Card) */}
        <div 
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${viewStory.user?._id}`); setIndex(null) }}
          className='user-info-header absolute top-7 left-4 flex items-center space-x-3 p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all z-50 cursor-pointer'
        >
          <img src={viewStory.user?.profilePic || viewStory.user?.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="" className='size-7 rounded-full object-cover border border-white/50'/>
          <div className='text-white text-xs font-semibold flex items-center gap-1'>
            <span>{viewStory.user?.fullName || viewStory.user?.full_name}</span>
            <BadgeCheck size={14} className='text-blue-400 fill-blue-400/20' />
          </div>
        </div>

        {/* Control Buttons (Mute + Close Inside Card) */}
        <div className='absolute top-7 right-4 flex items-center gap-2.5 z-50'>
          {type === 'video' && (
            <button 
              onClick={toggleMute}
              className='text-white hover:scale-110 active:scale-95 transition p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 cursor-pointer'
            >
              {isMuted ? <VolumeX className='w-4 h-4' /> : <Volume2 className='w-4 h-4' />}
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleClose() }}
            className='text-white hover:scale-110 active:scale-95 transition p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 cursor-pointer'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Play/Pause Overlay Indicator */}
        {!isPlaying && (
          <div className='absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 pointer-events-none animate-scale-up'>
            <Play className='w-6 h-6 text-white fill-white ml-0.5' />
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryViewer