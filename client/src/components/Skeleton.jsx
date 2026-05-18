import React from 'react'

const PostSkeleton = () => (
  <div className='bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4 w-full'>
     <div className='flex items-center gap-3'>
        <div className='w-12 h-12 rounded-full shimmer' />
        <div className='space-y-2 flex-1'>
           <div className='h-3 w-1/3 shimmer rounded' />
           <div className='h-2 w-1/4 shimmer rounded' />
        </div>
     </div>
     <div className='space-y-2'>
        <div className='h-3 w-full shimmer rounded' />
        <div className='h-3 w-full shimmer rounded' />
        <div className='h-3 w-2/3 shimmer rounded' />
     </div>
     <div className='h-48 w-full shimmer rounded-2xl' />
  </div>
)

const StorySkeleton = () => (
  <div className='min-w-[110px] h-[170px] rounded-2xl shimmer border border-slate-100' />
)

const Skeleton = ({ type }) => {
  if (type === 'post') return <PostSkeleton />
  if (type === 'story') return <StorySkeleton />
  
  return <div className='shimmer rounded' />
}

export default Skeleton
