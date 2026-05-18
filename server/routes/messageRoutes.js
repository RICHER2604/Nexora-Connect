const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, getUnreadCount } = require('../controllers/messageController');

const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/conversations/:userId', protect, getConversations);
router.get('/unread-count/:userId', protect, getUnreadCount);
router.get('/:userId/:otherId', protect, getMessages);

module.exports = router;
