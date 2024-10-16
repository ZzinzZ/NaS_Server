const HttpException = require("../core/HttpException");
const User = require("../Models/User.model");
const Profile = require("../Models/Profile.model");
const SearchHistory = require("../Models/SearchHistory.model");
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
    experience,
    education,
    birthday,
    relationship,
    bio,
    gender,
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
      // create new profile
      const newProfile = new Profile({
        userId,
        status: "init",
        userName: user?.name,
        gender,
        bio,
        location,
        background: null,
        experience,
        avatar: null,
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
      const profile = await Profile.findOne({ userId: userId })
        .populate("avatar")
        .populate("background")
        .exec();
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
    experience,
    education,
    birthday,
    relationship,
    gender,
    bio,
  }) => {
    try {
      const updateFields = {};

      if (location !== undefined) updateFields.location = location;
      if (experience !== undefined) updateFields.experience = experience;
      if (education !== undefined) updateFields.education = education;
      if (birthday !== undefined) updateFields.birthday = birthday;
      if (relationship !== undefined) updateFields.relationship = relationship;
      if (gender !== undefined) updateFields.gender = gender;
      if (bio !== undefined) updateFields.bio = bio;
      updateFields.status = "progress";

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
      const followerProfile = await Profile.findOne({ userId: followerId })
        .populate("avatar")
        .exec();
      const followedProfile = await Profile.findOne({ userId: followedId })
        .populate("avatar")
        .exec();
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
      const followerProfile = await Profile.findOne({ userId: followerId })
        .populate("avatar")
        .exec();
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
      const senderProfile = await Profile.findOne({ userId: senderId })
        .populate("avatar")
        .exec();
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
      const receiverProfile = await Profile.findOne({ userId: receiverId })
        .populate("avatar")
        .exec();
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
      const senderProfile = await Profile.findOne({ userId: senderId })
        .populate("avatar")
        .exec();
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
      const receiverProfile = await Profile.findOne({ userId: receiverId })
        .populate("avatar")
        .exec();
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
  unfriendUser: async ({ userId, friendId }) => {
    try {
      const userProfile = await Profile.findOne({ userId: userId });
      const friendProfile = await Profile.findOne({ userId: friendId });
      if (!userProfile || !friendProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const index = userProfile.friends.findIndex(
        (friend) => friend.userId.toString() === friendId
      );

      if (index === -1) {
        throw new HttpException(400, USER_MESSAGES.NO_FRIEND);
      }
      userProfile.friends.splice(index, 1);
      friendProfile.friends = friendProfile.friends.filter(
        (friend) => friend.userId.toString() !== userId
      );
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
      const blockerProfile = await Profile.findOne({ userId: blockerId })
        .populate("avatar")
        .exec();
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

      blockerProfile.blockedUsers.push({
        userId: blockedId,
        blockedAt: Date.now(),
      });
      blockedProfile.blockedBy.push({
        userId: blockerId,
        blockedAt: Date.now(),
      });

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
      const unblockerProfile = await Profile.findOne({ userId: unblockerId })
        .populate("avatar")
        .exec();
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
  },
  //get list friend
  getListFriend: async ({ userId }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const friendIds = userProfile.friends.map((friend) => friend.userId);
      const friendsProfiles = await Profile.find({ userId: { $in: friendIds } })
        .populate("avatar")
        .exec();

      return friendsProfiles;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // get list friend request
  getFriendRequest: async ({ userId }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const friendRequestIds = userProfile.friend_request.map(
        (request) => request.userId
      );
      const friendRequestProfiles = await Profile.find({
        userId: { $in: friendRequestIds },
      })
        .select("_id userId userName avatar")
        .populate("avatar")
        .exec();
      return friendRequestProfiles;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  getFriendRequestSent: async ({userId}) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const friendRequestIds = userProfile.sent_request.map(
        (request) => request.userId
      );
      const friendRequestProfiles = await Profile.find({
        userId: { $in: friendRequestIds },
      })
        .select("_id userId userName avatar")
        .populate("avatar")
        .exec();
      return friendRequestProfiles;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // add profile experience
  addProfileExperience: async ({
    userId,
    company,
    position,
    start,
    end,
    status,
  }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      if (!end) {
        userProfile.experience.push({
          company,
          position,
          start,
          status,
        });
      } else {
        userProfile.experience.push({
          company,
          position,
          start,
          end,
          status,
        });
      }
      console.log(userProfile);

      await userProfile.save();
      return userProfile.experience;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // delete profile experience
  deleteProfileExperience: async ({ userId, experienceId }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const experienceIndex = userProfile.experience.findIndex(
        (exp) => exp._id.toString() === experienceId
      );
      if (experienceIndex === -1) {
        throw new HttpException(400, USER_MESSAGES.NO_EXPERIENCE);
      }
      userProfile.experience.splice(experienceIndex, 1);
      await userProfile.save();
      return userProfile.experience;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // add profile education
  addProfileEducation: async ({ userId, school, start, end }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      userProfile.education.push({ school, start, end, status: true });
      await userProfile.save();
      return userProfile.education;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // delete profile education
  deleteProfileEducation: async ({ userId, educationId }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      const educationIndex = userProfile.education.findIndex(
        (edu) => edu.id === educationId
      );
      if (educationIndex === -1) {
        throw new HttpException(400, SYS_MESSAGE.NOT_FOUND);
      }
      userProfile.education.splice(educationIndex, 1);
      await userProfile.save();
      return userProfile.education;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // add profile location
  addProfileLocation: async ({ userId, type_location, city }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      // Kiểm tra xem loại địa chỉ đã tồn tại chưa
      const existingLocation = userProfile.location.find(
        (loc) => loc.type_location === type_location
      );
      if (existingLocation) {
        throw new HttpException(400, SYS_MESSAGE.TYPE_EXISTING);
      }

      // Kiểm tra nếu đã có 2 địa chỉ (hometown và current)
      if (userProfile.location.length >= 2) {
        throw new HttpException(400, SYS_MESSAGE.LIMIT_REACHED);
      }

      // Thêm địa chỉ mới
      userProfile.location.push({ type_location, city, status: true });
      await userProfile.save();
      return userProfile.location;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // delete profile location
  deleteProfileLocation: async ({ userId, locationId }) => {
    try {
      const userProfile = await Profile.findOne({ userId: userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const locationIndex = userProfile.location.findIndex(
        (loc) => loc._id.toString() === locationId
      );
      if (locationIndex === -1) {
        throw new HttpException(400, SYS_MESSAGE.NOT_FOUND);
      }
      userProfile.location.splice(locationIndex, 1);
      await userProfile.save();
      return userProfile.location;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // edit profile experience
  editProfileExperience: async ({
    userId,
    experienceId,
    company,
    position,
    start,
    end,
    status,
  }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const experience = userProfile.experience.id(experienceId);
      if (!experience) {
        throw new HttpException(400, USER_MESSAGES.NO_EXPERIENCE);
      }
      if (company) experience.company = company;
      if (position) experience.position = position;
      if (start) experience.start = start;
      if (end) experience.end = end;
      if (status !== undefined) experience.status = status;

      await userProfile.save();
      return userProfile.experience;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // edit profile education
  editProfileEducation: async ({
    userId,
    educationId,
    school,
    start,
    end,
    status,
  }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const education = userProfile.education.id(educationId);
      if (!education) {
        throw new HttpException(400, SYS_MESSAGE.NOT_FOUND);
      }
      if (school) education.school = school;
      if (start) education.start = start;
      if (end) education.end = end;
      if (status !== undefined) education.status = status;

      await userProfile.save();
      return userProfile.education;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  // edit profile location
  editProfileLocation: async ({
    userId,
    locationId,
    type_location,
    city,
    status,
  }) => {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }
      const location = userProfile.location.id(locationId);
      if (!location) {
        throw new HttpException(400, SYS_MESSAGE.NOT_FOUND);
      }
      if (type_location) location.type_location = type_location;
      if (city) location.city = city;
      if (status !== undefined) location.status = status;

      await userProfile.save();
      return userProfile.location;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //edit profile relationship
  editProfileRelationship: async ({ userId, type, status }) => {
    try {
      const userProfile = await Profile.findOne({ userId: userId });
      if (!userProfile) {
        throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
      }

      if (!["single", "married", "dating", "other"].includes(type)) {
        throw new HttpException(400, "Invalid relationship type");
      }
      if (typeof status !== "boolean") {
        throw new HttpException(400, "Invalid status value");
      }

      userProfile.relationship = { type, status };
      await userProfile.save();
      return userProfile.relationship;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
  //search profile
  searchProfiles: async ({ userName, userId }) => {
    try {
      const query = {};

      if (userName && typeof userName === "string") {
        query.userName = { $regex: userName, $options: "i" };
      }
      const profiles = await Profile.find(query)
        .select(
          "userId userName avatar friend_request sent_request friends blockedUsers blockedBy"
        )
        .populate("avatar")
        .exec();

      if (userName && userId) {
        const newSearchHistory = new SearchHistory({
          keyword: userName,
          userId: userId,
        });
        await newSearchHistory.save();
      }

      return profiles;
    } catch (error) {
      throw new HttpException(error.status || 500, error.message || error);
    }
  },
};

module.exports = ProfileService;
