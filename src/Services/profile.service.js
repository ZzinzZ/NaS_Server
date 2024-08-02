const HttpException = require("../core/HttpException");
const User = require("../Models/User.model");
const Profile = require("../Models/Profile.model");
const {
  USER_AVATAR_ORIGINAL,
  USER_BACKGROUND_ORIGINAL,
} = require("../core/configs/profile.config");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");

const ProfileService = {
  //create a new profile
  createProfile: async ({
    userId,
    location,
    background,
    experience,
    avatar,
    education,
    birthday,
    relationship,
  }) => {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        throw new HttpException(404, SYS_MESSAGE.NO_USER);
      }
      // Check if user already has a profile
      const profile = await Profile.findOne({ userId: userId });
      if (profile) {
        throw new HttpException(409, SYS_MESSAGE.USER_ALREADY_HAS_PROFILE);
      }
      if (!avatar) {
        avatar = USER_AVATAR_ORIGINAL;
      }
      if (!background) {
        background = USER_BACKGROUND_ORIGINAL;
      }
      // create new profile
      const newProfile = new Profile({
        userId,
        userName: user?.name,
        location,
        background,
        experience,
        avatar,
        education,
        birthday,
        relationship,
        followers: [],
        following: [],
        friend_request: [],
        sent_request: [],
        friends: [],
      });
      await newProfile.save();
      return newProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // get a profile by id
  getProfileById: async ({ profileId }) => {
    try {
      const profile = await Profile.findById({ _id: profileId });
      if (!profile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      return profile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //get profile by userId
  getProfileByUserId: async ({ userId }) => {
    try {
      const profile = await Profile.findOne({ userId: userId });
      if (!profile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      return profile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // update a profile
  updateProfile: async ({
    profileId,
    location,
    background,
    experience,
    avatar,
    education,
    birthday,
    relationship,
}) => {
    try {
        const updateFields = {};

        if (location !== undefined) updateFields.location = location;
        if (background) updateFields.background = background;  // Only set if not null
        if (experience !== undefined) updateFields.experience = experience;
        if (avatar) updateFields.avatar = avatar;  // Only set if not null
        if (education !== undefined) updateFields.education = education;
        if (birthday !== undefined) updateFields.birthday = birthday;
        if (relationship !== undefined) updateFields.relationship = relationship;

        const profile = await Profile.findByIdAndUpdate(
            profileId,
            { $set: updateFields },
            { new: true }
        );

        if (!profile) {
            throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
        }

        return profile;
    } catch (error) {
        throw new HttpException(error.status || 500, error.message || error);
    }
},

  //follow profile
  followProfile: async ({ followerId, followedId }) => {
    try {
      const followerProfile = await Profile.findOne({ userId: followerId });
      const followedProfile = await Profile.findOne({ userId: followedId });
      if (!followerProfile || !followedProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const alreadyFollowing = followerProfile.following.some(
        (follow) => follow.userId.toString() === followedId
      );

      if (alreadyFollowing) {
        throw new HttpException(400, USER_MESSAGES.FOLLOW_ALREADY);
      }
      followedProfile.followers.push({ userId: followerId });
      followerProfile.following.push({ userId: followedId });
      await followerProfile.save();
      await followedProfile.save();
      return followerProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //unfollow profile
  unfollowProfile: async ({ followerId, followedId }) => {
    try {
      const followerProfile = await Profile.findOne({ userId: followerId });
      const followedProfile = await Profile.findOne({ userId: followedId });
      if (!followerProfile || !followedProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const index = followerProfile.following.findIndex(
        (follow) => follow.userId.toString() === followedId
      );

      if (index === -1) {
        throw new HttpException(400, USER_MESSAGES.NOT_FOLLOWING);
      }
      followerProfile.following.splice(index, 1);
      followedProfile.followers = followedProfile.followers.filter(
        (follower) => follower.userId.toString() !== followerId
      );
      await followerProfile.save();
      await followedProfile.save();
      return followerProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //send add friend request
  addFriendRequest: async ({ senderId, receptionId }) => {
    try {
      const senderProfile = await Profile.findOne({ userId: senderId });
      const receiverProfile = await Profile.findOne({ userId: receptionId });
      if (!senderProfile || !receiverProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const alreadyRequested = receiverProfile.friend_request.some(
        (request) => request.userId.toString() === senderId
      );
      if (alreadyRequested) {
        throw new HttpException(400, USER_MESSAGES.FRIEND_REQUEST_ALREADY_SENT);
      }
      receiverProfile.friend_request.push({
        userId: senderId,
        time: Date.now(),
      });
      senderProfile.sent_request.push({
        userId: receptionId,
        time: Date.now(),
      });
      await senderProfile.save();
      await receiverProfile.save();
      return senderProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //accept friend request
  acceptFriendRequest: async ({ senderId, receiverId }) => {
    try {
      const senderProfile = await Profile.findOne({ userId: senderId });
      const receiverProfile = await Profile.findOne({ userId: receiverId });
      if (!senderProfile || !receiverProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const requestIndex = receiverProfile.friend_request.findIndex(
        (request) => request.userId.toString() === senderId
      );
      if (requestIndex === -1) {
        throw new HttpException(400, USER_MESSAGES.NO_REQUEST);
      }
      receiverProfile.friend_request.splice(requestIndex, 1);
      senderProfile.sent_request = senderProfile.sent_request.filter(
        (request) => request.userId.toString() !== receiverId
      );
      receiverProfile.friends.push({ userId: senderId, time: Date.now() });
      senderProfile.friends.push({ userId: receiverId, time: Date.now() });
      await senderProfile.save();
      await receiverProfile.save();
      return receiverProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //remove the request
  removeFriendRequest: async ({ senderId, receiverId }) => {
    try {
      const senderProfile = await Profile.findOne({ userId: senderId });
      const receiverProfile = await Profile.findOne({ userId: receiverId });
      if (!senderProfile || !receiverProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const requestIndex = receiverProfile.friend_request.findIndex(
        (request) => request.userId.toString() === senderId
      );
      if (requestIndex === -1) {
        throw new HttpException(400, USER_MESSAGES.NO_REQUEST);
      }
      receiverProfile.friend_request.splice(requestIndex, 1);
      senderProfile.sent_request = senderProfile.sent_request.filter(
        (request) => request.userId.toString() !== receiverId
      );
      await senderProfile.save();
      await receiverProfile.save();
      return senderProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },

  // reject requests
  rejectFriendRequest: async ({ senderId, receiverId }) => {
    try {
      const senderProfile = await Profile.findOne({ userId: senderId });
      const receiverProfile = await Profile.findOne({ userId: receiverId });
      if (!senderProfile || !receiverProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const requestIndex = receiverProfile.friend_request.findIndex(
        (request) => request.userId.toString() === senderId
      );
      if (requestIndex === -1) {
        throw new HttpException(400, USER_MESSAGES.NO_REQUEST);
      }
      receiverProfile.friend_request.splice(requestIndex, 1);
      await receiverProfile.save();
      return receiverProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //unfriend user profile
  unfriendUser: async ({userId, friendId}) => {
    try {
        const userProfile = await Profile.findOne({userId: userId});
        const friendProfile = await Profile.findOne({ userId: friendId });
        if(!userProfile || !friendProfile){
            throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
        }
        const index = userProfile.friends.findIndex((friend) => friend.userId.toString() === friendId);

        if(index !== -1) {
            throw new HttpException(400, USER_MESSAGES.NO_FRIEND)
        }
        userProfile.friends.slice(index, 1);
        friendProfile.friends = friendProfile.friends.filter((friend) => friend.userId.toString() !== userId);
        await userProfile.save();
        await friendProfile.save();
        return userProfile;
    } catch (error) {
        throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //block user 
  blockUser: async ({ blockerId, blockedId }) => {
    try {
      const blockerProfile = await Profile.findOne({ userId: blockerId });
      const blockedProfile = await Profile.findOne({ userId: blockedId });

      if (!blockerProfile || !blockedProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      const alreadyBlocked = blockerProfile.blockedUsers.some(
        (user) => user.userId.toString() === blockedId
      );
      if (alreadyBlocked) {
        throw new HttpException(400, USER_MESSAGES.USER_ALREADY_BLOCKED);
      }

      blockerProfile.blockedUsers.push({ userId: blockedId, blockedAt: Date.now() });
      blockedProfile.blockedBy.push({ userId: blockerId, blockedAt: Date.now() });

      await blockerProfile.save();
      await blockedProfile.save();

      return blockerProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //unblock user
  unblockUser: async ({ unblockerId, blockedId }) => {
    try {
      const unblockerProfile = await Profile.findOne({ userId: unblockerId });
      const blockedProfile = await Profile.findOne({ userId: blockedId });

      if (!unblockerProfile || !blockedProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      const isBlocked = unblockerProfile.blockedUsers.some(
        (user) => user.userId.toString() === blockedId
      );
      if (!isBlocked) {
        throw new HttpException(400, USER_MESSAGES.USER_NOT_BLOCKED);
      }

      // Thực hiện gỡ chặn
      unblockerProfile.blockedUsers = unblockerProfile.blockedUsers.filter(
        (user) => user.userId.toString() !== blockedId
      );
      blockedProfile.blockedBy = blockedProfile.blockedBy.filter(
        (user) => user.userId.toString() !== unblockerId
      );

      await unblockerProfile.save();
      await blockedProfile.save();

      return unblockerProfile;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  }
};

module.exports = ProfileService;
