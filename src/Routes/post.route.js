const express = require('express');
const upload = require('../middlewares/cloudinaryMiddleware');
const PostController = require('../Controllers/post.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/avatar', upload.single("avatar"),authMiddleware, PostController.createNewAvatar);

router.delete('/:postId', authMiddleware, PostController.deletePost);

router.post('/background', upload.single("background"), PostController.createNewBackground);

router.post('/article', upload.array("pictures"), PostController.createArticlePost);

router.get('/article/:userId', PostController.getUserArticlePosts);

router.put('/react/:postId', PostController.addReactPost);

router.post('/comments/:postId',upload.single("image"), PostController.addCommentPost);

router.get('/comments/sort-react/:postId', PostController.getPostComments)

router.put('/comments/react/:postId',PostController.reactToComment);
router.put('/comments/reply/react/:postId',PostController.reactToReplyComment);
router.post('/share/:postId', PostController.sharePost);
router.get('/list_photos/:userId', PostController.getListPhoto)
router.get('/post_photos/:userId', PostController.getPhotoPosts);
router.delete('/comments/:postId', PostController.deleteCommentPost);
router.get('/detail/:postId', PostController.getPostDetails);

module.exports = router;