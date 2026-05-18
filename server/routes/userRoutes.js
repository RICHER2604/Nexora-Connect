const express = require('express');
const router = express.Router();
const { getUserProfile, getUserById, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile/:username', getUserProfile);
router.get('/:userId', getUserById);
router.put('/update/:userId', protect, updateProfile);

module.exports = router;
