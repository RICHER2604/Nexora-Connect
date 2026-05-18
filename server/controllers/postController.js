const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'fullName username profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a post
exports.createPost = async (req, res) => {
    const { userId, content, imageUrls } = req.body;
    try {
        const newPost = new Post({
            user: userId,
            content,
            imageUrls
        });
        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('user', 'fullName username profilePic');
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like a post
exports.likePost = async (req, res) => {
    const { postId, userId } = req.body;
    const io = req.app.get('io');

    if (!isValidId(postId) || !isValidId(userId)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }
    try {
        const post = await Post.findById(postId).populate('user');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isLiked = post.likes.some(id => id.toString() === userId);

        if (!isLiked) {
            const updatedPost = await Post.findByIdAndUpdate(
                postId, 
                { $addToSet: { likes: userId } },
                { new: true }
            ).populate('user', 'fullName username profilePic');

            // Create Notification
            if (post.user._id.toString() !== userId && post.user.notificationSettings?.activity !== false) {
                const liker = await User.findById(userId);
                const newNotif = new Notification({
                    recipient: post.user._id,
                    sender: userId,
                    type: 'like',
                    content: `${liker.fullName} liked your post`,
                    link: `/post/${postId}`
                });
                await newNotif.save();
                io.emit('newNotification', { recipientId: post.user._id.toString(), notification: newNotif });
            }

            res.status(200).json({ message: 'Post liked', post: updatedPost });
        } else {
            const updatedPost = await Post.findByIdAndUpdate(
                postId, 
                { $pull: { likes: userId } },
                { new: true }
            ).populate('user', 'fullName username profilePic');
            res.status(200).json({ message: 'Post unliked', post: updatedPost });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Comment on a post
exports.commentPost = async (req, res) => {
    const { postId, userId, text } = req.body;
    const io = req.app.get('io');

    if (!isValidId(postId) || !isValidId(userId)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }
    try {
        const newComment = {
            user: userId,
            text,
            createdAt: new Date()
        };
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: newComment } },
            { new: true }
        ).populate('comments.user', 'fullName username profilePic')
         .populate('user');

        // Create Notification
        if (updatedPost.user._id.toString() !== userId && updatedPost.user.notificationSettings?.activity !== false) {
            const commenter = await User.findById(userId);
            const newNotif = new Notification({
                recipient: updatedPost.user._id,
                sender: userId,
                type: 'comment',
                content: `${commenter.fullName} commented on your post`,
                link: `/post/${postId}`
            });
            await newNotif.save();
            io.emit('newNotification', { recipientId: updatedPost.user._id.toString(), notification: newNotif });
        }

        const addedComment = updatedPost.comments[updatedPost.comments.length - 1];
        res.status(200).json(addedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get posts by a specific user
exports.getPostsByUser = async (req, res) => {
    const { userId } = req.params;
    if (!isValidId(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const posts = await Post.find({ user: userId })
            .populate('user', 'fullName username profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get post by ID
exports.getPostById = async (req, res) => {
    const { postId } = req.params;
    if (!isValidId(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }
    try {
        const post = await Post.findById(postId).populate('user', 'fullName username profilePic');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!isValidId(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post.' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
