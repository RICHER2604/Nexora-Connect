import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { Bell, Heart, MessageSquare, UserPlus, Trash2, CheckCircle2, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Notifications = () => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('nexora_token')
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Filter only requested types: like, comment, share
            const filtered = res.data.filter(n => ['like', 'comment', 'share'].includes(n.type))
            setNotifications(filtered)
        } catch (err) {
            console.error('Error fetching notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('nexora_token')
            await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            toast.success('All notifications marked as read')
        } catch (err) {
            console.error('Mark read error:', err)
            toast.error('Failed to update notifications')
        }
    }

    const handleNotificationClick = async (n) => {
        try {
            const token = localStorage.getItem('nexora_token')
            if (!n.isRead) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read/${n._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif))
            }
            if (n.link) navigate(n.link)
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className='w-4 h-4 text-rose-500 fill-rose-500' />
            case 'comment': return <MessageSquare className='w-4 h-4 text-indigo-500' />
            case 'share': return <Share2 className='w-4 h-4 text-emerald-500' />
            case 'follow': return <UserPlus className='w-4 h-4 text-emerald-500' />
            case 'message': return <MessageSquare className='w-4 h-4 text-blue-500' />
            default: return <Bell className='w-4 h-4 text-gray-500' />
        }
    }

    return (
        <div className='py-8 max-w-2xl mx-auto px-4 animate-fade-in'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-black text-gray-800 dark:text-white'>Notifications</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Stay updated with your social circle</p>
                </div>
                <button 
                    onClick={markAllRead}
                    className='flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all'
                >
                    <CheckCircle2 size={14} />
                    Mark all read
                </button>
            </div>

            <div className='space-y-4'>
                {loading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className='p-5 bg-white dark:bg-slate-900 rounded-[32px] animate-pulse flex gap-4'>
                            <div className='w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full' />
                            <div className='flex-1 space-y-3 py-1'>
                                <div className='h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4' />
                                <div className='h-2 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/4' />
                            </div>
                        </div>
                    ))
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div 
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${!n.isRead ? 'ring-2 ring-indigo-500/10 bg-indigo-50/10' : ''}`}
                        >
                            <div className='relative'>
                                <img 
                                    src={n.sender?.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                                    alt='' 
                                    className='w-12 h-12 rounded-2xl object-cover shadow-sm'
                                />
                                <div className='absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-50 dark:border-slate-700'>
                                    {getIcon(n.type)}
                                </div>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm text-gray-800 dark:text-gray-200 leading-relaxed'>
                                    <span className='font-black text-gray-900 dark:text-white mr-1'>{n.sender?.fullName}</span>
                                    {n.content}
                                </p>
                                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2'>
                                    {moment(n.createdAt).fromNow()}
                                </p>
                            </div>
                            {!n.isRead && (
                                <div className='w-2 h-2 bg-indigo-500 rounded-full mt-2 animate-pulse' />
                            )}
                        </div>
                    ))
                ) : (
                    <div className='text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800'>
                        <div className='w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <Bell className='w-10 h-10 text-slate-200 dark:text-slate-700' />
                        </div>
                        <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-2'>No notifications yet</h3>
                        <p className='text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto'>When someone interacts with you or your posts, you'll see it here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Notifications
