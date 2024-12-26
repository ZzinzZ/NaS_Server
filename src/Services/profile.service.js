const HttpException = require("../core/HttpException");
const User = require("../Models/User.model");
const Profile = require("../Models/Profile.model");
const SearchHistory = require("../Models/SearchHistory.model");
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
  },

  getProfileById: async ({ profileId }) => {
    const profile = await Profile.findById({ _id: profileId });
    if (!profile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }
    return profile;
  },

  //get profile by userId
  getProfileByUserId: async ({ userId }) => {
    const profile = await Profile.findOne({ userId: userId })
      .populate("avatar")
      .populate("background")
      .exec();
    if (!profile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }
    return profile;
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
  },

  //follow profile
  followProfile: async ({ followerId, followedId }) => {
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
  },
  //unfollow profile
  unfollowProfile: async ({ followerId, followedId }) => {
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
  },
  //send add friend request
  addFriendRequest: async ({ senderId, receptionId }) => {
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
  },
  //accept friend request
  acceptFriendRequest: async ({ senderId, receiverId }) => {
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
  },
  //remove the request
  removeFriendRequest: async ({ senderId, receiverId }) => {
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
    console.log("friend request", receiverProfile);
    console.log("sender profile", senderId);

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
  },

  // reject requests
  rejectFriendRequest: async ({ senderId, receiverId }) => {
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
    await receiverProfile.save();
    return receiverProfile;
  },
  //unfriend user profile
  unfriendUser: async ({ userId, friendId }) => {
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
  },
  //block user
  blockUser: async ({ blockerId, blockedId }) => {
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
  },
  //unblock user
  unblockUser: async ({ unblockerId, blockedId }) => {
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
  },
  //get list friend
  getListFriend: async ({ userId }) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }
    const friendIds = userProfile.friends.map((friend) => friend.userId);
    const friendsProfiles = await Profile.find({ userId: { $in: friendIds } })
      .populate("avatar")
      .select(
        "avatar userId userName location background experience bio gender friends education relationship createdAt blockedUsers"
      )
      .exec();

    return friendsProfiles;
  },
  // get list friend request
  getFriendRequest: async ({ userId }) => {
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
  },
  getFriendRequestSent: async ({ userId }) => {
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
  },
  // delete profile experience
  deleteProfileExperience: async ({ userId, experienceId }) => {
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
  },
  // add profile education
  addProfileEducation: async ({ userId, school, start, end }) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }
    userProfile.education.push({ school, start, end, status: true });
    await userProfile.save();
    return userProfile.education;
  },
  // delete profile education
  deleteProfileEducation: async ({ userId, educationId }) => {
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
  },
  // add profile location
  addProfileLocation: async ({ userId, type_location, city }) => {
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
  },
  // delete profile location
  deleteProfileLocation: async ({ userId, locationId }) => {
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
  },
  // edit profile location
  editProfileLocation: async ({
    userId,
    locationId,
    type_location,
    city,
    status,
  }) => {
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
  },
  //edit profile relationship
  editProfileRelationship: async ({ userId, type, status }) => {
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
  },
  //search profile
  searchProfiles: async ({ userName, userId }) => {
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
      const existingSearch = await SearchHistory.findOne({
        keyword: userName,
        userId,
      });

      if (existingSearch) {
        existingSearch.updatedAt = new Date();
        await existingSearch.save();
      } else {
        const newSearchHistory = new SearchHistory({
          keyword: userName,
          userId: userId,
        });
        await newSearchHistory.save();
      }
    }

    return profiles;
  },
  getUnfriendedProfiles: async ({ userId }) => {
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }

    const friendIds = userProfile.friends.map((friend) =>
      friend.userId.toString()
    );
    const unfriendedProfiles = await Profile.find({
      userId: { $nin: [...friendIds, userId] },
    }).select("userId userName avatar").populate("avatar").limit(5).exec();
    return unfriendedProfiles;
  },
  getSuggestedProfiles: async ({ userId }) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }

    const friendIds = userProfile.friends.map((friend) =>
      friend.userId.toString()
    );

    const secondDegreeFriends = await Profile.find({
      userId: { $in: friendIds }, 
    }).select("friends.userId");

    const secondDegreeFriendIds = secondDegreeFriends
      .flatMap((profile) =>
        profile.friends.map((friend) => friend.userId.toString())
      )
      .filter((id) => !friendIds.includes(id) && id !== userId);

    const commonFriendCounts = secondDegreeFriendIds.reduce((acc, userId) => {
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {});

    const suggestedProfiles = await Profile.find({
      userId: { $in: Object.keys(commonFriendCounts) },
    })
      .select("userId userName avatar")
      .populate("avatar")
      .lean();

      const result = suggestedProfiles
      .map((profile) => ({
        ...profile,
        commonFriends: commonFriendCounts[profile.userId.toString()],
      }))
      .sort((a, b) => b.commonFriends - a.commonFriends) 
      .slice(0, 5);

    return result;
  },
};

module.exports = ProfileService;
