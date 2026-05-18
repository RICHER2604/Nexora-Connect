const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost, commentPost, getPostsByUser, deletePost, getPostById } = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/create', protect, createPost);
router.post('/like', protect, likePost);
router.post('/comment', protect, commentPost);
router.get('/user/:userId', getPostsByUser);
router.get('/:postId', getPostById);
router.delete('/:postId', protect, deletePost);

module.exports = router;
