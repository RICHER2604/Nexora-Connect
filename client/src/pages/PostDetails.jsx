import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import { ArrowLeft } from 'lucide-react'

const PostDetails = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`)
        setPost(res.data)
      } catch (err) {
        console.error('Post fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  if (loading) return <Loading />
  if (!post) return <div className='p-10 text-center'>Post not found</div>

  return (
    <div className='max-w-2xl mx-auto py-6 px-4 animate-fade-in'>
      <button 
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 hover:text-indigo-600 transition-colors font-bold text-sm'
      >
        <ArrowLeft size={18} /> Back
      </button>
      
      <PostCard post={post} />
    </div>
  )
}

export default PostDetails
