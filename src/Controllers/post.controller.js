const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const PostService = require("../Services/post.service");

const PostController = {
  // create avatar new post
  createNewAvatar: async (req, res, next) => {
    try {
      const { userId } = req.body;
      const avatar = req.file.path;
      const newAvatar = await PostService.createNewAvatar({ userId, avatar });
      res.created(SYS_MESSAGE.SUCCESS, newAvatar);
    } catch (error) {
      next(error);
    }
  },

  createNewBackground: async (req, res, next) => {
    try {
      const { userId } = req.body;
      const background = req.file.path;
      const newBackground = await PostService.createNewBackground({
        userId,
        background,
      });
      res.created(SYS_MESSAGE.SUCCESS, newBackground);
    } catch (error) {
      next(error);
    }
  },
  //create article post
  createArticlePost: async (req, res, next) => {
    try {
      const { userId, content } = req.body;
      
       
      const pictures = req.files ? req.files.map((file) => file.path) : [];
      console.log(pictures);
      const article = await PostService.createArticlePost({
        userId,
        content,
        pictures,
      });
      res.created(USER_MESSAGES.POST_CREATED_SUCCESS, article);
    } catch (error) {
      next(error);
    }
  },
  //get list posts
  getListPosts: async (req, res, next) => {
    try {
      const {userId} = req.params;
      const posts = await PostService.getListPosts({userId});
      res.ok(SYS_MESSAGE.SUCCESS, posts);
    } catch (error) {
      next(error);
    }
  },
  //get user article posts
  getUserArticlePosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await PostService.getUserArticlePosts({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //create new event post
  createNewEventPost: async (req, res, next) => {
    try {
      const { userId, content } = req.body;
      const media_url = req.files ? req.files.map((file) => file.path) : [];
      const event = await PostService.createNewEventPost({
        userId,
        content,
        media_url,
      });
      res.created(SYS_MESSAGE.SUCCESS, event);
    } catch (error) {
      next(error);
    }
  },
  //get user event posts
  getUserEventPosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await PostService.getUserEventPosts({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //get details of post
  getPostDetails: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const post = await PostService.getDetailPost({ postId });
      res.ok(SYS_MESSAGE.SUCCESS, post);
    } catch (error) {
      next(error);
    }
  },

  // react post
  addReactPost: async(req, res, next) => {
    try {
      const {userId, emotion } = req.body;
      const { postId } = req.params;
      const result = await PostService.addReactPost({ postId, userId, emotion });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //add comment to post
  addCommentPost: async(req, res, next) => {
    try {
      const { userId, content, replyToCommentId, gif } = req.body;
      const { postId } = req.params;
      console.log("req",req.file);
      
      const image = req.file ? req.file.path : undefined;
      const comment = await PostService.addComment({ postId, userId, content, image,gif,replyToCommentId })
      console.log(comment);
      
      res.ok(SYS_MESSAGE.SUCCESS, comment)
    } catch (error) {
      next(error);
    }
  },
  //Get comments
  getPostComments: async (req, res, next) => {
    try {
      const {postId} = req.params;
      const comments = await PostService.getSortedCommentsWithReplies(postId);
      res.ok(SYS_MESSAGE.SUCCESS, comments);
    } catch (error) {
      next(error);
    }
  },
  reactToComment : async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { commentId,emotion,userId } = req.body;
  
      const updatedComment = await PostService.reactComment({
        postId,
        commentId,
        userId,
        emotion,
      });
  
      res.ok(SYS_MESSAGE.SUCCESS, updatedComment);
    } catch (error) {
      next(error);
    }
  },
  //react reply comment
  reactToReplyComment: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { commentId, replyCommentId, userId, emotion } = req.body;
  
      const updatedComment = await PostService.reactReplyComment({
        postId,
        commentId,
        userId,
        emotion,
        replyCommentId,
      });
  
      res.ok(SYS_MESSAGE.SUCCESS, updatedComment);
    } catch (error) {
      next(error);
    }
  },
  //delete comment
  deleteCommentPost: async(req, res, next) => {
    try {
      const { postId } = req.params;
      const { commentId } = req.body;
      const result = await PostService.deleteComment({ commentId, postId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //delete post
  deletePost: async(req, res, next) => {
    try {
      const { postId } = req.params;
      const result = await PostService.deletePost({ postId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //share post
  sharePost: async(req, res, next) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
      const result = await PostService.sharePost({ postId, userId });
      res.ok(USER_MESSAGES.SHARE_POST_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  getPhotoPosts: async(req, res, next) => {
    try {
      const {userId} = req.params;
      const posts = await PostService.getPhotoPosts({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, posts);
    } catch (error) {
      next(error);
    }
  },
  getListPhoto: async(req, res, next) => {
    try {
      const {userId} = req.params;
      const photos = await PostService.getListPhoto({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, photos);
    } catch (error) {
      next(error)
    }
  },

};

module.exports = PostController;
