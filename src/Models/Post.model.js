const mongoose = require("mongoose");

const { Schema } = mongoose;

const EmotionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, index: true },
  emotion: {
    type: String,
    required: true,
    enum: ["like", "haha", "favorite", "wow", "angry", "sad", "wtf"],
  },
  time: { type: Date, default: Date.now() },
  _id: false,
});

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, index: true },
  replyToCommentId: { type: Schema.Types.ObjectId },
  content: { type: String },
  image: { type: String },
  gif: { type: String },
  replies: [this],
  react: [EmotionSchema],
  time: { type: Date, default: Date.now() },
});

const SharedContentSchema = new Schema({
  originalPostId: { type: Schema.Types.ObjectId, ref: "Posts" }, 
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  caption: { type: String }, 
  media: [
    {
      media_url: { type: String },
      _id: false,
    },
  ],
});

const PostsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, index: true },
    post_type: {
      type: String,
      enum: ["article", "story", "avatar","share", "background"],
    },
    content: {
      caption: { type: String },
      media: [
        {
          type: { type: String, enum: ["photo", "video"] },
          media_url: { type: String },
          _id: false,
        },
      ],
    },
    react: [EmotionSchema],
    shareContent:SharedContentSchema,
    share: [
      {
        time: { type: Date , default: Date.now() },
        userId: { type: Schema.Types.ObjectId },
        _id: false,
      },
    ],
    comment: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const Posts = mongoose.model("Posts", PostsSchema);

module.exports = Posts;
