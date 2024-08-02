const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, unique: true, required: true },
  userName: { type: String, required: true},
  location: { type: String },
  background: { type: String },
  experience: [{
    company: { type: String },
    from: { type: Date },
    position: { type: String },
    to: { type: Date },
    _id: false,
  }],
  avatar: { type: String },
  friend_request: [{
    time: { type: Date },
    userId: { type: Schema.Types.ObjectId },
    _id: false,
  }],
  sent_request:[{
    time: { type: Date },
    userId: { type: Schema.Types.ObjectId },
    _id: false,
  }],
  friends: [{
    time: { type: Date },
    userId: { type: Schema.Types.ObjectId },
    _id: false,
  }],
  education: [{
    from: { type: Date },
    school: { type: String },
    to: { type: Date },
    _id: false,
  }],
  relationship: { type: String },
  birthday: { type: Date },
  following: [{
    userId: { type: Schema.Types.ObjectId},
    _id: false,
  }],
  followers: [{
    userId: { type: Schema.Types.ObjectId},
    _id: false,
  }],
  blockedUsers: [{
    userId: { type: Schema.Types.ObjectId },
    blockedAt: { type: Date }
  }],
  blockedBy: [{
    userId: { type: Schema.Types.ObjectId},
    blockedAt: { type: Date }
  }],

});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
