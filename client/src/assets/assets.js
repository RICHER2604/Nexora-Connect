/* eslint-disable no-unused-vars */
import logo from './logo.png'
import sample_cover from './sample_cover1.jpg'
import sample_profile from './nexora_profile.png'
import bgImage from './bgImage.png'
import group_user from './group_user.png'
import { Home, MessageCircle, Search, UserIcon, Users } from 'lucide-react'
import sponsored_img from './sponsored_img.png'

export const assets = { 
    logo, 
    sample_cover, 
    sample_profile, 
    bgImage, 
    group_user, 
    sponsored_img }

export const menuItemData = [
    { to: '/', label: 'Feed', Icon: Home},
    { to: '/messages', label: 'Messages', Icon: MessageCircle },
    { to: '/connections', label: 'Connections', Icon: Users},
    { to: '/discover', label: 'Discover', Icon: Search },
    { to: '/profile', label: 'Profile', Icon: UserIcon },
];

export const dummyUserData = {
    "_id": "69r1b2s3p4e5f67890abcdef",
    "email": "admin@nexora.com",
    "full_name": "Nexora Connect",
    "username": "nexora_ad02",
    "bio": "🙏 Welcome to Nexora Connect| 💕 connect with people you know/love 🫂.",
    "profile_picture": sample_profile,
    "cover_photo": sample_cover,
    "location": "India, IN",
    "followers": ["user02", "user03"],
    "following": ["user02", "user03"],
    "connections": ["user02", "user03"],
    "posts": [],
    "is_verified": true,
    "createdAt": "2026-03-01T10:27:55.321Z",
    "updatedAt": "2026-03-03T05:15:38.124Z",
}

const dummyUserData2 = {
    ...dummyUserData,
    _id: "user02",
    username: "Rishabh Pandey",
    full_name: "Rishabh Pandey",
    profile_picture: "https://unsplash.com/photos/mens-blue-and-white-button-up-collared-top-DItYlc26zVI"
}

const dummyUserData3 = {
    ...dummyUserData,
    _id: "user03",
    username: "Ritik Sharma",
    full_name: "Ritik Sharma",
    profile_picture: "https://unsplash.com/photos/man-standing-near-white-wall-d1UPkiFd04A"
}

export const dummyPostsData = [
  {
    _id: "1",
    content: "Beautiful nature 🌿",
    createdAt: new Date(),
    image_urls: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    user: {
      full_name: "Rishabh Pandey",
      username: "rishabh",
      profile_picture: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    _id: "2",
    content: "#Travel vibes ✈️",
    createdAt: new Date(),
    image_urls: [
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    ],
    user: {
      full_name: "Nexora Connect User",
      username: "nexora",
      profile_picture: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  },

  {
    _id: "post3",
    content: "Hello Everyone Welcome to your social space! #Nexora Connect 🚀",
    image_urls: [sample_cover],
    likes: 10,
    comments: [],
    createdAt: new Date(2026, 3, 21),
    user: dummyUserData
  },
  {
    _id: "post4",
    content: "Hello Nexora Connect 🚀 Fam, Connect to the user you feel worth connecting to!",
    image_urls: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"
    ],
    likes: 5,
    comments: [],
    createdAt: new Date(2026, 3, 20),
    user: dummyUserData
  },
  {
    _id: "post5",
    content: "Connecting to people on #NexoraConnect feels amazing! 🌟",
    image_urls: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
    ],
    likes: 8,
    comments: [],
    createdAt: new Date(2026, 4, 23),
    user: dummyUserData
  },
  {
    _id: "post6",
    content: "MY NEW POST ON THE #NexoraConnect SOCIAL 🚀",
    image_urls: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"
    ],
    likes: 12,
    comments: [],
    createdAt: new Date(2026, 4, 23),
    user: dummyUserData
  },
  {
    _id: "post7",
    content: "LOVING To Be On #NexoraConnect 🌟",
    image_urls: [], 
    likes: 15,
    comments: [],
    createdAt: new Date(),
    user: dummyUserData
  }
];

export const dummyStoriesData = [
 {
   "_id": "story1",
   "user": dummyUserData,
   "content": "📌This is the demo story. And i your able to see this, that means i will post something interesting.Enjoy the Sunny Day ! ☀️",
   "media_url": "",
   "media_type": "text", 
   "background_color": "#1b89ea",
   "createdAt": "2026-04-21T08:23:07.321Z",
   "updatedAt": "2026-04-21T10:23:07.321Z",
 },
 {
   "_id": "story2",
   "user": dummyUserData,
   "content": "",
   "media_url": "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg",
   "media_type": "image",
   "background_color": "#0be2c2",
   "createdAt": "2026-04-20T12:45:07.321Z",
   "updatedAt": "2026-04-21T12:45:07.321Z"
 },
 {
  "_id": "story3",
   "user": dummyUserData,
   "content": "",
   "media_url":"https://www.w3schools.com/html/mov_bbb.mp4",
   "media_type": "video",
   "background_color": "#e80664",
   "createdAt": "2026-04-21T01:04:07.321Z",
   "updatedAt": "2026-04-21T01:04:07.321Z",
 },
 {
  "_id": "story4",
   "user": dummyUserData,
   "content": "",
   "media_url": "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
   "media_type": "image",
   "background_color": "#14e355",
   "createdAt": "2026-04-23T01:04:07.323Z",
   "updatedAt": "2026-04-23T01:04:07.323Z",
 },
 {
 "_id": "story5",
   "user": dummyUserData,
   "content": "",
   "media_url": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
   "media_type": "image",
   "background_color": "#ea7807",
   "createdAt": "2026-04-20T01:04:08.123Z",
   "updatedAt": "2026-04-20T01:04:08.123Z",
 },
]
