const Posts = require("../Models/Post.model");
const Profile = require("../Models/Profile.model");
const User = require("../Models/User.model");
const HttpException = require("../core/HttpException");
const mongoose = require("mongoose");

const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");

const getSortedComments = async (postId) => {
  try {
    const post = await Posts.findById(postId);
    if (!post) {
      throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
    }

    const comments = await Posts.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      { $unwind: "$comment" },
      {
        $addFields: {
          reactionCount: { $size: "$comment.react" },
        },
      },
      { $sort: { reactionCount: -1 } },
      {
        $group: {
          _id: "$_id",
          comments: { $push: "$comment" },
        },
      },
    ]);

    return comments.length > 0 ? comments[0].comments : [];
  } catch (error) {
    throw new HttpException(error.status || 500, error.message || error);
  }
};

const sortReplies = (comments) => {
  return comments.map((comment) => {
    if (comment.replyToCommentId) {
      comment.replies.sort((a, b) => b.react.length - a.react.length);
    }
    return comment;
  });
};

const PostService = {
  // create a new avatar post
  createNewAvatar: async ({ userId, avatar }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      const newPost = new Posts({
        userId,
        post_type: "avatar",
        content: {
          caption: `${user?.name} updated new avatar`,
          media: [{ 
            type: "photo",
            media_url: avatar 
          }],
        },
      });

      await newPost.save();
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId },
        { avatar: newPost._id },
        { new: true }
      );

      return updatedProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },

  // create a new background post
  createNewBackground: async ({ userId, background }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      const newPost = new Posts({
        userId,
        post_type: "background",
        content: {
          caption: `${user?.name} updated new background`,
          media: [{ 
            type: "photo",
            media_url: background
           }],
        },
      });

      await newPost.save();
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId },
        { background: newPost._id },
        { new: true }
      );

      return updatedProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //create a article post
  createArticlePost: async ({ userId, content, pictures }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      if (!content && (!pictures || pictures.length === 0)) {
        throw new HttpException(400, USER_MESSAGES.POST_EMPTY);
      }
      const newPost = new Posts({
        userId,
        post_type: "article",
        content: {
          caption: content,
          media: pictures.map((picture) => {
            return {
              type: "photo",
              media_url: picture,
            };
          }),
        },
      });

      await newPost.save();
      return newPost;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },

  createArticleVideoPost: async ({ userId, content, video }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      if (!content && (!video || pictures.length === 0)) {
        throw new HttpException(400, USER_MESSAGES.POST_EMPTY);
      }
      const newPost = new Posts({
        userId,
        post_type: "article",
        content: {
          caption: content,
          media: {
              type: "video",
              media_url: video,
            }
        },
      });

      await newPost.save();
      return newPost;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // create a new event post
  createEventPost: async ({ userId, content, media_url }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      const newPost = new Posts({
        userId,
        post_type: "event",
        content: {
          caption: content,
          media: {
            type: "photo",
            media_url,
          },
        },
      });

      await newPost.save();
      return newPost;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // create a new story post
  createStoryPost: async ({ userId, content, media_url }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      const newPost = new Posts({
        userId,
        post_type: "story",
        content: {
          content,
          media_url,
        },
      });

      await newPost.save();
      return newPost;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // get all article posts of a user
  getUserArticlePosts: async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
  
      const postTypes = ["article", "avatar", "background", "share"];
      const posts = await Posts.find({ userId, post_type: { $in: postTypes } })
        .sort({ createdAt: -1 });
  
      return posts;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  getDetailPost: async ({ postId }) => {
    try {
      const post = await Posts.findById(postId);
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }
      const profile = await Profile.findOne({userId: post.userId}).populate("avatar").exec();

      if(!profile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      return {
        post,
        profile,
      };
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // get all event posts of a user
  getUserEventPosts: async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }
      const posts = await Posts.find({ userId, post_type: "event" }).sort({
        createdAt: -1,
      });
      return posts;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  addReactPost: async ({ postId, userId, emotion }) => {
    try {
      const post = await Posts.findById(postId);
      if (!post) {
        throw new HttpException(404, "Post not found");
      }
      const existingReactionIndex = post.react.findIndex(
        (react) => react.userId.toString() === userId.toString()
      );

      if (existingReactionIndex !== -1) {
        if (post.react[existingReactionIndex].emotion === emotion) {
          post.react.splice(existingReactionIndex, 1);
        } else {
          post.react[existingReactionIndex].emotion = emotion;
          post.react[existingReactionIndex].time = Date.now();
        }
      } else {
        post.react.push({
          userId,
          emotion,
          time: Date.now(),
        });
      }

      await post.save();
      return post.react[0];
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  addComment: async ({
    postId,
    userId,
    content,
    image,
    gif,
    replyToCommentId,
  }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }

      const post = await Posts.findById(postId);
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }

      if (!content && !image && !gif) {
        throw new HttpException(400, USER_MESSAGES.COMMENT_EMPTY);
      }

      const newComment = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        content,
        image: image,
        gif,
        replyToCommentId: replyToCommentId || null,
        react: [],
        time: Date.now(),
      };

      if (replyToCommentId) {
        const parentComment = post.comment.id(replyToCommentId);
        if (!parentComment) {
          throw new HttpException(400, USER_MESSAGES.REPLY_COMMENT_NOT_FOUND);
        }
        parentComment.replies.push(newComment);
      } else {
        post.comment.push(newComment);
      }
      await post.save();
      return {
        post: post,
        comment: newComment,
      };
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //delete post
  deletePost: async ({ postId }) => {
    try {
      const post = await Posts.findOne({ _id: postId });
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }
      await Posts.deleteOne({ _id: postId });
      return true;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //delete comment
  deleteComment: async ({ commentId, postId }) => {
    try {
      const post = await Posts.findOne({ _id: postId });
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }
      const commentIndex = post.comment.findIndex(
        (comment) => comment._id.toString() === commentId.toString()
      );
      if (commentIndex === -1) {
        throw new HttpException(404, USER_MESSAGES.COMMENT_NOT_FOUND);
      }
      post.comment.splice(commentIndex, 1);
      await post.save();
      return true;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //react comment
  reactComment: async ({ postId, commentId, userId, emotion }) => {
    try {
      const post = await Posts.findById(postId);
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }

      const comment = post.comment.id(commentId);
      if (!comment) {
        throw new HttpException(404, USER_MESSAGES.REPLY_COMMENT_NOT_FOUND);
      }

      const existingReactionIndex = comment.react.findIndex(
        (react) => react.userId.toString() === userId.toString()
      );

      if (existingReactionIndex !== -1) {
        if (comment.react[existingReactionIndex].emotion === emotion) {
          comment.react.splice(existingReactionIndex, 1);
        } else {
          comment.react[existingReactionIndex].emotion = emotion;
          comment.react[existingReactionIndex].time = Date.now();
        }
      } else {
        comment.react.push({
          userId,
          emotion,
          time: Date.now(),
        });
      }

      await post.save();

      return comment.react[0];
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },

  reactReplyComment: async ({
    postId,
    commentId,
    replyCommentId,
    userId,
    emotion,
  }) => {
    try {
      const post = await Posts.findById(postId).exec();
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }
  
      const comment = post.comment.id(commentId);
      if (!comment) {
        throw new HttpException(404, USER_MESSAGES.COMMENT_NOT_FOUND);
      }
  
      // Locate reply comment using traditional array methods
      const replyComment = comment.replies.find(
        (reply) => reply._id.toString() === replyCommentId
      );
      if (!replyComment) {
        throw new HttpException(404, USER_MESSAGES.COMMENT_NOT_FOUND);
      }
  
      // Proceed with reaction handling as before
      const existingReactionIndex = replyComment.react.findIndex(
        (react) => react.userId.toString() === userId.toString()
      );
  
      if (existingReactionIndex !== -1) {
        if (replyComment.react[existingReactionIndex].emotion === emotion) {
          replyComment.react.splice(existingReactionIndex, 1);
        } else {
          replyComment.react[existingReactionIndex].emotion = emotion;
          replyComment.react[existingReactionIndex].time = Date.now();
        }
      } else {
        replyComment.react.push({
          userId,
          emotion,
          time: Date.now(),
        });
      }
  
      comment.markModified('replies'); // Mark the nested reply comment as modified
      await post.save();
  
      return replyComment.react[0];
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },

  //get post comments
  getSortedCommentsWithReplies: async (postId) => {
    const comments = await getSortedComments(postId);
    const sortedComments = sortReplies(comments);
    return sortedComments;
  },

  //share post
  sharePost: async ({ postId, userId }) => {
    try {
      const post = await Posts.findById(postId);
      if (!post) {
        throw new HttpException(404, USER_MESSAGES.POST_NOT_FOUND);
      }
  
      const sharedPost = new Posts({
        userId, 
        post_type: "share",
        shareContent: {
          originalPostId: post._id,
          userId: post.userId,
          caption: post.content.caption, 
          media: post.content.media, 
        },
      });
  
      await sharedPost.save();
  
      post.share.push({
        userId,
        time: Date.now(),
      });

      await post.save();
  
      return {
        sharedPost,
        originalPost: post,
      }; 
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  getPhotoPosts: async ({userId}) => {
    try {
      const posts = await Posts.find({
        userId: userId,
        "content.media": { $elemMatch: { type: "photo" } }
      });
  
      return posts;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  getListPhoto: async ({userId}) => {
    try {
      const posts = await Posts.find({
        userId: userId,
        "content.media": { $elemMatch: { type: "photo" } }
      });
  
      const images = posts.flatMap(post =>
        post.content.media
          .filter(mediaItem => mediaItem.type === "photo")
          .map(mediaItem => ({
            image: mediaItem.media_url,
            postId: post._id
          }))
      );
  
      return images;
    } catch (error) {
      console.error("Error fetching user images:", error);
      throw error;
    }
  },
};

module.exports = PostService;
