const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Follow/Unfollow a user
exports.toggleFollow = async (req, res) => {
    const { currentUserId, targetUserId } = req.body;
    const io = req.app.get('io');

    if (currentUserId === targetUserId) return res.status(400).json({ message: "You cannot follow yourself" });

    try {
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

        if (!isFollowing) {
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
            const updatedUser = await User.findByIdAndUpdate(
                currentUserId, 
                { $addToSet: { following: targetUserId } },
                { new: true }
            );

            // Create Notification
            if (targetUser.notificationSettings?.activity !== false) {
                const newNotif = new Notification({
                    recipient: targetUserId,
                    sender: currentUserId,
                    type: 'follow',
                    content: `${currentUser.fullName} started following you`,
                    link: `/profile/${currentUserId}`
                });
                await newNotif.save();
                
                // Emit real-time if user is online (socket logic in index.js handles delivery)
                io.emit('newNotification', { recipientId: targetUserId, notification: newNotif });
            }

            res.status(200).json({ message: "User followed", user: updatedUser });
        } else {
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
            const updatedUser = await User.findByIdAndUpdate(
                currentUserId, 
                { $pull: { following: targetUserId } },
                { new: true }
            );
            res.status(200).json({ message: "User unfollowed", user: updatedUser });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Search users
exports.searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
        const users = await User.find({
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get suggested users
exports.getSuggestedUsers = async (req, res) => {
    const { userId } = req.params;
    try {
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            // If user not found, just return some random users
            const users = await User.find({ _id: { $ne: userId } }).limit(5);
            return res.status(200).json(users);
        }

        const suggested = await User.find({
            _id: { $ne: userId, $nin: currentUser.following }
        }).limit(5);
        res.status(200).json(suggested);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
