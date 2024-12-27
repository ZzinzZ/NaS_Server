const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true,
      indexed: true,
      ref: "Users",
    },
    status: { type: String, enum: ["init", "progress", "complete"] },
    userName: { type: String, required: true },
    location: [
      {
        type_location: {type: String, enum: ["hometown","current"]},
        city: {type: String},
        status: { type: Boolean},
      }
    ],
    background: { type: Schema.Types.ObjectId, ref: "Posts" },
    experience: [
      {
        company: { type: String },
        start: { type: String },
        position: { type: String },
        end: { type: String },
        status: { type: Boolean },
      },
    ],
    avatar: { type: Schema.Types.ObjectId, ref: "Posts" },
    bio: { type: String },
    gender: { type: String },
    friend_request: [
      {
        time: { type: Date },
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        _id: false,
      },
    ],
    sent_request: [
      {
        time: { type: Date },
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        _id: false,
      },
    ],
    friends: [
      {
        time: { type: Date },
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        _id: false,
      },
    ],
    education: [
      {
        from: { type: String },
        school: { type: String },
        to: { type: String },
        status: { type: Boolean },
      },
    ],
    relationship: {
      type: { type: String, enum: ["single", "married", "dating","other"] },
      status: { type: Boolean },
    },
    birthday: { type: Date },
    following: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        _id: false,
      },
    ],
    followers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        _id: false,
      },
    ],
    blockedUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        blockedAt: { type: Date },
      },
    ],
    blockedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        blockedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
