/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share2, MoreHorizontal, Send, Smile } from 'lucide-react'
import moment from 'moment'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import { useRef } from 'react'

const PostCard = ({post}) => {
   const navigate = useNavigate()
   const user = JSON.parse(localStorage.getItem('nexora_user'))
   const [liked, setLiked] = useState(Array.isArray(post.likes) ? post.likes.includes(user?._id) : false);
   const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0));
   const [showComments, setShowComments] = useState(false);
   const [showMenu, setShowMenu] = useState(false);
   const [commentText, setCommentText] = useState('');
   const [comments, setComments] = useState(post.comments || []);
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
   const emojiPickerRef = useRef();

   const handleLike = async () => {
     if (!user) return
     
     try {
       await axios.post(`${import.meta.env.VITE_API_URL}/api/posts/like`, {
         postId: post._id,
         userId: user._id
       })
       
       if (liked) {
         setLikesCount(prev => prev - 1);
       } else {
         setLikesCount(prev => prev + 1);
       }
       setLiked(!liked);
     } catch (err) {
       console.error('Error liking post:', err)
       if (err.response?.status === 400) {
         toast.error('You cannot like demo posts. Try creating your own post!')
       }
     }
   }

   const handleComment = async (e) => {
     e.preventDefault()
     if (!commentText.trim() || !user) return

     try {
       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/posts/comment`, {
         postId: post._id,
         userId: user._id,
         text: commentText
       })
       
       setComments(prev => [...prev, { ...res.data, user: { fullName: user.fullName, profilePic: user.profilePic } }])
       setCommentText('')
       toast.success('Comment added!')
     } catch (err) {
       console.error('Error adding comment:', err)
       if (err.response?.status === 400) {
         toast.error('You cannot comment on demo posts. Create a post first!')
       } else {
         toast.error('Failed to add comment.')
       }
     }
   }

   const handleDelete = async () => {
     if (!window.confirm('Are you sure you want to delete this post?')) return
     try {
       const token = localStorage.getItem('nexora_token')
       await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
         data: { userId: user._id },
         headers: { Authorization: `Bearer ${token}` }
       })
       toast.success('Post deleted')
       window.location.reload()
     } catch (err) {
       toast.error('Failed to delete post')
     }
   }

   const handleShareToStory = async () => {
     try {
       const token = localStorage.getItem('nexora_token')
       await axios.post(`${import.meta.env.VITE_API_URL}/api/stories/create`, {
         userId: user._id,
         sharedPost: post._id,
         mediaType: 'text',
         content: 'Shared a post'
       }, {
         headers: { Authorization: `Bearer ${token}` }
       })
       toast.success('Shared to your story! ✨')
       setShowMenu(false)
     } catch (err) {
       toast.error('Failed to share to story')
     }
   }

   const handleExternalShare = (platform) => {
     const url = `${window.location.origin}/post/${post._id}`
     const text = `Check out this post on Nexora Connect: ${post.content}`
     
     let shareUrl = ''
     switch(platform) {
       case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`; break;
       case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
       case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
       default: 
         if (navigator.share) {
           navigator.share({ title: 'Nexora Connect', text, url })
         } else {
           navigator.clipboard.writeText(url)
           toast.success('Link copied to clipboard!')
         }
         return
     }
     window.open(shareUrl, '_blank')
   }

   const onEmojiClick = (emojiObject) => {
     setCommentText(prev => prev + emojiObject.emoji)
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

   const formatContent = (content) => {
     if (!content) return null;
     return content.split(' ').map((word, i) => {
       if (word.startsWith('#')) {
         return <span key={i} className='text-indigo-600 font-medium cursor-pointer hover:underline'>{word} </span>
       }
       return word + ' '
     })
   }

   return (
    <div className='bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 space-y-4 w-full mx-auto hover:shadow-md transition-all duration-300 max-w-2xl animate-fade-in border border-slate-100 dark:border-slate-800'>
        {/* User Info */}
        <div className='flex items-center justify-between'>
            <div onClick={() => navigate(`/profile/${post.user?._id}`)} className='flex items-center gap-3 cursor-pointer group'>
                <img src={post.user?.profilePic || post.user?.profile_picture} alt="" className='w-11 h-11 rounded-full shadow-sm object-cover group-hover:ring-2 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/50 transition-all' />
                <div>
                    <div className='flex items-center space-x-1'>
                        <span className='font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors'>{post.user?.fullName || post.user?.full_name}</span>
                        <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-500/10' />
                    </div>
                    <div className='text-gray-500 dark:text-gray-400 text-[11px] font-medium'>@{post.user?.username} • {moment(post.createdAt).fromNow()} </div>
                </div>
            </div>
            <div className='relative'>
               <div 
                onClick={() => setShowMenu(!showMenu)}
                className='p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors'
               >
                  <MoreHorizontal className='w-5 h-5 text-gray-400' />
               </div>
               
               {showMenu && (
                 <div className='absolute right-0 top-10 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-30 py-2 animate-fade-in'>
                    <button 
                      onClick={handleShareToStory}
                      className='w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors'
                    >
                       Share to Story
                    </button>
                    {user?._id === (post.user?._id || post.user) && (
                      <button 
                        onClick={handleDelete}
                        className='w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors'
                      >
                         Delete Post
                      </button>
                    )}
                 </div>
               )}
            </div>
        </div>

        {/* Content */}
        {post.content && (
           <div className='text-gray-800 dark:text-gray-200 text-sm leading-relaxed'>
             {formatContent(post.content)}
           </div>
        )}
      
        {/* Media (Images/Videos) */}
        {(post.image_urls?.length > 0 || post.imageUrls?.length > 0) && (() => {
            const mediaList = post.imageUrls || post.image_urls;
            return (
              <div className='overflow-hidden rounded-2xl border border-slate-50 dark:border-slate-800 shadow-inner'>
                  <div className={`grid ${mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 bg-slate-50 dark:bg-slate-800`}>
                      {mediaList.map((media, index) => {
                          if (media.startsWith('data:video')) {
                            return (
                              <video 
                                src={media} 
                                key={index} 
                                controls
                                className={`w-full object-cover bg-black ${mediaList.length === 1 ? 'max-h-[500px]' : 'h-48'}`} 
                              />
                            )
                          }
                          return (
                            <img 
                              src={media} 
                              key={index} 
                              className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${mediaList.length === 1 ? 'max-h-[500px]' : 'h-48'}`} 
                              alt="" 
                            />
                          )
                      })}
                  </div>
              </div>
            )
        })()}

        {/* Interactions */}
        <div className='flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800'>
            <div className='flex items-center gap-4'>
                <div onClick={handleLike} className='flex items-center gap-1 cursor-pointer group'>
                    <div className={`p-2 rounded-full transition-all ${liked ? 'bg-rose-50 dark:bg-rose-900/20' : 'hover:bg-rose-50 dark:hover:bg-rose-900/10'}`}>
                        <Heart className={`w-5 h-5 transition-all ${liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-500 dark:text-gray-400 group-hover:text-rose-500 group-active:scale-90'}`} />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${liked ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-rose-500'}`}>{likesCount}</span>
                </div>
                <div onClick={() => setShowComments(!showComments)} className='flex items-center gap-1 cursor-pointer group'>
                    <div className={`p-2 rounded-full transition-all ${showComments ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10'}`}>
                        <MessageCircle className={`w-5 h-5 transition-all ${showComments ? 'text-indigo-600 fill-indigo-600/10' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 group-active:scale-90'}`} />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${showComments ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600'}`}>{comments.length}</span>
                </div>
            </div>
            <div className='relative group/share'>
               <div onClick={() => handleExternalShare('native')} className='flex items-center gap-1 cursor-pointer group'>
                   <div className='p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all'>
                       <Share2 className='w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white group-active:scale-90' />
                   </div>
                   <span className='text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white'>Share</span>
               </div>
               
               {/* Share Tooltip */}
               <div className='absolute bottom-12 right-0 hidden group-hover/share:flex bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 gap-2 animate-slide-up z-20'>
                  {['whatsapp', 'facebook', 'twitter'].map((plat) => (
                    <div 
                      key={plat}
                      onClick={(e) => { e.stopPropagation(); handleExternalShare(plat) }}
                      className='p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all'
                    >
                       <img src={`https://cdn-icons-png.flaticon.com/512/${plat === 'whatsapp' ? '733/733585' : plat === 'facebook' ? '733/733547' : '733/733579'}.png`} className='w-5 h-5 object-contain' alt='' />
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Comment Section Toggle */}
        {showComments && (
           <div className='pt-4 border-t border-slate-50 dark:border-slate-800 space-y-4 animate-fade-in'>
              {/* Existing Comments */}
              <div className='space-y-3 max-h-40 overflow-y-auto no-scrollbar'>
                 {comments.map((c, i) => (
                    <div key={i} className='flex gap-3 items-start'>
                       <img src={c.user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt='' className='w-6 h-6 rounded-full object-cover mt-1' />
                       <div className='bg-slate-100 dark:bg-slate-800 p-2 rounded-xl flex-1'>
                          <p className='text-[10px] font-bold text-gray-800 dark:text-gray-200'>{c.user?.fullName || 'User'}</p>
                          <p className='text-[11px] text-gray-600 dark:text-gray-400'>{c.text}</p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleComment} className='flex gap-3'>
                 <img src={user?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt='' className='w-8 h-8 rounded-full object-cover' />
                 <div className='flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 focus-within:ring-2 ring-indigo-500/20'>
                    <input 
                      type='text' 
                      placeholder='Write a comment...' 
                      className='bg-transparent outline-none w-full text-xs dark:text-white'
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className='relative' ref={emojiPickerRef}>
                       <Smile 
                        className={`w-4 h-4 cursor-pointer transition-colors ${showEmojiPicker ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`} 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                       />
                       {showEmojiPicker && (
                         <div className='absolute bottom-8 right-0 z-50 shadow-2xl animate-slide-up'>
                            <EmojiPicker 
                              onEmojiClick={onEmojiClick} 
                              theme='light'
                              width={280}
                              height={350}
                            />
                         </div>
                       )}
                    </div>
                    <button type='submit'>
                       <Send className={`w-4 h-4 cursor-pointer transition-colors ${commentText.trim() ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                 </div>
              </form>
           </div>
        )}

    </div>
  )
}

export default PostCard