const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications for current user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'fullName profilePic username')
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark notification as read
router.put('/mark-read/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark all as read
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update notification preferences
router.put('/settings', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { notificationSettings: req.body },
            { new: true }
        ).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
