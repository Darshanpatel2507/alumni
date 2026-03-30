const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  deletePost,
  likePost,
  addComment
} = require('../controllers/postController');
const { protect, approvedOnly } = require('../middleware/auth');

// All post routes require authentication and approval for alumni
router.use(protect, approvedOnly);

router.route('/')
  .post(createPost)
  .get(getPosts);

router.route('/:id')
  .delete(deletePost);

router.put('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;
