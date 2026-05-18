const express = require('express');
const router = express.Router();
const { toggleFollow, searchUsers, getSuggestedUsers } = require('../controllers/connectionController');

const { protect } = require('../middleware/authMiddleware');

router.post('/toggle', protect, toggleFollow);
router.get('/search', searchUsers);
router.get('/suggested/:userId', getSuggestedUsers);

module.exports = router;
