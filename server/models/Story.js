const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video', 'text'], default: 'image' },
    content: { type: String, default: '' },
    backgroundColor: { type: String, default: '#4f46e5' },
    sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    expiresAt: { 
        type: Date, 
        default: () => new Date(+new Date() + 24*60*60*1000), // 24 hours from now
        index: { expires: '24h' } 
    },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
