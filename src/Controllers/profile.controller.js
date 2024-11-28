const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const chatService = require("../Services/chat.service");
const ProfileService = require("../Services/profile.service");

const ProfileController = {
  // create a new profile
  createProfile: async (req, res, next) => {
    try {
      const {
        userId,
        location,
        education,
        relationship,
        experience,
        birthday,
      } = req.body;
      const parsedEducation = JSON.parse(education);
      const parsedExperience = JSON.parse(experience);
      const result = await ProfileService.createProfile({
        userId,
        location,
        experience: parsedExperience,
        education: parsedEducation,
        birthday,
        relationship,
      });
      res.created(USER_MESSAGES.PROFILE_CREATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // get a profile by id
  getProfileById: async (req, res, next) => {
    try {
      const { profileId } = req.params;
      const profile = await ProfileService.getProfileById({ profileId });
      res.ok(SYS_MESSAGE.SUCCESS, profile);
    } catch (error) {
      next(error);
    }
  },
  // get a profile by user id
  getProfileByUserId: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const profile = await ProfileService.getProfileByUserId({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, profile);
    } catch (error) {
      next(error);
    }
  },
  //Update profile avatar
  updateProfileAvatar: async (req, res, next) => {
    try {
      const { profileId } = req.body;
      const avatar = req.file;

      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // update profile cover image
  updateProfileCoverImage: async (req, res, next) => {
    try {
      const { profileId } = req.params;
      const { coverImage } = req.body;
      const result = await ProfileService.updateProfileCoverImage({
        profileId,
        coverImage,
      });
      res.ok(USER_MESSAGES.PROFILE_UPDATE_COVER_IMAGE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // update profile
  updateProfile: async (req, res, next) => {
    try {
      const { profileId } = req.params;
      const {
        location,
        education,
        relationship,
        experience,
        birthday,
        gender,
        bio,
      } = req.body;

      let parsedEducation;
      let parsedExperience;

      if (education !== undefined) {
        parsedEducation = JSON.parse(education);
      }

      if (experience !== undefined) {
        parsedExperience = JSON.parse(experience);
      }

      const result = await ProfileService.updateProfile({
        profileId,
        location,
        experience: parsedExperience,
        education: parsedEducation,
        birthday,
        relationship,
        gender,
        bio,
      });

      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  // follow a profile
  followProfile: async (req, res, next) => {
    try {
      const { followedId } = req.params;
      const { followerId } = req.body;
      const result = await ProfileService.followProfile({
        followerId,
        followedId,
      });
      res.ok(USER_MESSAGES.FOLLOW_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // unfollow a profile
  unfollowProfile: async (req, res, next) => {
    try {
      const { followedId } = req.params;
      const { followerId } = req.body;
      const result = await ProfileService.unfollowProfile({
        followerId,
        followedId,
      });
      res.ok(USER_MESSAGES.UNFOLLOW_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // send friend request
  addFriendRequest: async (req, res, next) => {
    try {
      const { receptionId } = req.params;
      const { senderId } = req.body;
      const result = await ProfileService.addFriendRequest({
        senderId,
        receptionId,
      });
      res.ok(USER_MESSAGES.FRIEND_REQUEST_SENT_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // accept request
  acceptFriendRequest: async (req, res, next) => {
    try {
      const { receiverId } = req.params;
      const { senderId } = req.body;
      const result = await ProfileService.acceptFriendRequest({
        senderId,
        receiverId,
      });
      await chatService.createPrivateChat({userId: receiverId, participantId: senderId});
      res.ok(USER_MESSAGES.FRIEND_REQUEST_ACCEPTED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // reject request
  rejectFriendRequest: async (req, res, next) => {
    try {
      const { receiverId } = req.params;
      const { senderId } = req.body;
      const result = await ProfileService.rejectFriendRequest({
        senderId,
        receiverId,
      });
      res.ok(USER_MESSAGES.FRIEND_REQUEST_DECLINED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //remove the request
  removeFriendRequest: async (req, res, next) => {
    try {
      const { receiverId } = req.params;
      const { senderId } = req.body;
      const result = await ProfileService.removeFriendRequest({
        senderId,
        receiverId,
      });
      res.ok(USER_MESSAGES.FRIEND_REQUEST_REMOVED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //unfriend
  unfriendUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { friendId } = req.body;
      const result = await ProfileService.unfriendUser({ userId, friendId });
      res.ok(USER_MESSAGES.UNFRIEND_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  // block user
  blockUser: async (req, res, next) => {
    try {
      const { blockerId } = req.params;
      const { blockedId } = req.body;
      const result = await ProfileService.blockUser({ blockerId, blockedId });
      res.ok(USER_MESSAGES.USER_BLOCKED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  // unblock user
  unblockUser: async (req, res, next) => {
    try {
      const { unblockerId } = req.params;
      const { blockedId } = req.body;
      const result = await ProfileService.unblockUser({
        unblockerId,
        blockedId,
      });
      res.ok(USER_MESSAGES.USER_UNBLOCKED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  getListFriend: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await ProfileService.getListFriend({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //
  addExperience: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { company, position, start, end, status } = req.body;
      const result = await ProfileService.addProfileExperience({
        userId,
        company,
        position,
        start,
        end,
        status
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //
  deleteExperience: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { experienceId } = req.body;
      const result = await ProfileService.deleteProfileExperience({
        userId,
        experienceId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //
  editExperience: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { experienceId, company, position, start, end, status } = req.body;
      const result = await ProfileService.editProfileExperience({
        userId,
        experienceId,
        company,
        position,
        start,
        end,
        status,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //
  addEducation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { school, start, end } = req.body;
      const result = await ProfileService.addProfileEducation({
        userId,
        school,
        start,
        end,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  deleteEducation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { educationId } = req.body;
      console.log(req.body);
      
      const result = await ProfileService.deleteProfileEducation({
        userId,
        educationId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  editEducation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { educationId, school, start, end, status } = req.body;
      const result = await ProfileService.editProfileEducation({
        userId,
        educationId,
        school,
        start,
        end,
        status,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  addLocation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { type_location, city } = req.body;
      const result = await ProfileService.addProfileLocation({
        userId,
        type_location,
        city,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  deleteLocation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { locationId } = req.body;
      const result = await ProfileService.deleteProfileLocation({
        userId,
        locationId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },

  editLocation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { locationId, type_location, city, status } = req.body;
      const result = await ProfileService.editProfileLocation({
        userId,
        locationId,
        type_location,
        city,
        status,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //edit profile relationships
  editProfileRelationship: async(req, res, next) => {
    try {
      const userId = req.params;
      const {type, status} = req.body;
      const result = await ProfileService.editProfileRelationship({ userId, type, status });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //search profile
  searchProfiles: async(req, res, next) => {
    try {
      const {userName , userId} = req.body;
      const result = await ProfileService.searchProfiles({userName, userId});
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //get list request
  getListFriendRequest: async (req, res, next) => {
    try {
      const {userId} = req.params;
      const result = await ProfileService.getFriendRequest({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  //get list request sent
  getListFriendRequestSent: async (req, res, next) => {
    try {
      const {userId} = req.params;
      const result = await ProfileService.getFriendRequestSent({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ProfileController;
