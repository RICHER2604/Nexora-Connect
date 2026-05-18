const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send message
exports.sendMessage = async (req, res) => {
    const { sender, receiver, text } = req.body;
    const io = req.app.get('io');

    try {
        const newMessage = new Message({ sender, receiver, text });
        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'fullName username profilePic')
            .populate('receiver');

        // Create Notification
        if (populatedMessage.receiver.notificationSettings?.messages !== false) {
            const newNotif = new Notification({
                recipient: receiver,
                sender: sender,
                type: 'message',
                content: `${populatedMessage.sender.fullName} sent you a message`,
                link: `/messages/${sender}`
            });
            await newNotif.save();
            io.emit('newNotification', { recipientId: receiver, notification: newNotif });
        }

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    const { userId, otherId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherId },
                { sender: otherId, receiver: userId }
            ]
        })
        .populate('sender', 'fullName username profilePic')
        .populate('receiver', 'fullName username profilePic')
        .sort({ createdAt: 1 });
        res.status(200).json(messages);

        // Mark these messages as read
        await Message.updateMany(
            { sender: otherId, receiver: userId, isRead: false },
            { $set: { isRead: true } }
        );

        // Mark related notifications as read
        await Notification.updateMany(
            { recipient: userId, sender: otherId, type: 'message', isRead: false },
            { $set: { isRead: true } }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get unread message count for a user
exports.getUnreadCount = async (req, res) => {
    const { userId } = req.params;
    try {
        const count = await Message.countDocuments({ receiver: userId, isRead: false });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get conversations list (recent messages for a user)
exports.getConversations = async (req, res) => {
    const { userId } = req.params;
    try {
        // Find messages where user is sender or receiver
        // This is a simplified version, usually you'd aggregate for latest message per user
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('sender', 'fullName username profilePic')
        .populate('receiver', 'fullName username profilePic')
        .sort({ createdAt: -1 });

        // Filter for unique participants
        const participants = [];
        const uniqueConversations = [];

        messages.forEach(msg => {
            // Check if sender and receiver are populated
            if (!msg.sender || !msg.receiver) return;

            const other = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
            
            // Final check to ensure 'other' exists
            if (!other) return;

            if (!participants.includes(other._id.toString())) {
                participants.push(other._id.toString());
                uniqueConversations.push({
                    participant: other,
                    lastMessage: msg.text,
                    createdAt: msg.createdAt
                });
            }
        });

        res.status(200).json(uniqueConversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
