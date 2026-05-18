const express = require('express');
const router = express.Router();
const { getStories, createStory } = require('../controllers/storyController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getStories);
router.post('/create', protect, createStory);

module.exports = router;
