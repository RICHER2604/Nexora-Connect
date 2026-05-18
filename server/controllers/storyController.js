const Story = require('../models/Story');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all stories (filter for last 24 hours)
exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
        .populate('user', 'fullName username profilePic')
        .populate({
            path: 'sharedPost',
            populate: { path: 'user', select: 'fullName username profilePic' }
        })
        .sort({ createdAt: -1 });
        res.status(200).json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a story
exports.createStory = async (req, res) => {
    const { userId, mediaUrl, mediaType, content, backgroundColor, sharedPost } = req.body;
    try {
        const newStory = new Story({
            user: userId,
            mediaUrl,
            mediaType,
            content,
            backgroundColor,
            sharedPost
        });
        await newStory.save();
        const populatedStory = await Story.findById(newStory._id)
            .populate('user', 'fullName username profilePic')
            .populate({
                path: 'sharedPost',
                populate: { path: 'user', select: 'fullName username profilePic' }
            });

        // Trigger Notification if it's a shared post
        if (sharedPost) {
            const io = req.app.get('io');
            const post = await Post.findById(sharedPost);
            const sharer = await User.findById(userId);
            
            // Only notify if someone ELSE shared it
            if (post && post.user.toString() !== userId) {
                const newNotif = new Notification({
                    recipient: post.user,
                    sender: userId,
                    type: 'share',
                    content: `${sharer.fullName} shared your post to their story`,
                    link: `/profile/${sharer._id}` // Link to sharer's profile to see the story
                });
                await newNotif.save();
                io.emit('newNotification', { recipientId: post.user.toString(), notification: newNotif });
            }
        }

        res.status(201).json(populatedStory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
