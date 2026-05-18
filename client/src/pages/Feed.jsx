import React, { useState, useEffect } from 'react'
import axios from 'axios'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import AddPost from '../components/AddPost'
import Skeleton from '../components/Skeleton'
import { dummyPostsData } from '../assets/assets'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`)
      setFeeds(res.data.length > 0 ? res.data : dummyPostsData)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setFeeds(dummyPostsData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className='h-full py-6 md:py-8'>
       {/* Stories */}
       <div className='mb-6'>
         <StoriesBar />
       </div>
       
       {/* Add Post */}
       <AddPost onPostCreated={fetchPosts} />

       {/* Feed list */}
       <div className='space-y-6'>
         {loading ? (
           <>
             <Skeleton type='post' />
             <Skeleton type='post' />
             <Skeleton type='post' />
           </>
         ) : (
           feeds.map((post)=>(
              <PostCard key={post._id || post.id} post={post} />
           ))
         )}
       </div>
    </div>
  )
}

export default Feed