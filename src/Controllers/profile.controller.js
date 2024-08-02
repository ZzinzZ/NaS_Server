const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
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
      const avatar = req.files["avatar"] ? req.files["avatar"][0].path : null;
      const background = req.files["background"]
        ? req.files["background"][0].path
        : null;
      const parsedEducation = JSON.parse(education);
      const parsedExperience = JSON.parse(experience);
      const result = await ProfileService.createProfile({
        userId,
        location,
        background,
        experience: parsedExperience,
        avatar,
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
        } = req.body;

        const avatar = req.files["avatar"] ? req.files["avatar"][0].path : null;
        const background = req.files["background"] ? req.files["background"][0].path : null;

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
            background: background || undefined,  // Only pass if not null
            experience: parsedExperience,
            avatar: avatar || undefined,  // Only pass if not null
            education: parsedEducation,
            birthday,
            relationship,
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
  unfriendUser: async(req, res, next) => {
    try {
      const {userId} = req.params;
      const {friendId} = req.body;
      const result = await ProfileService.unfriendUser({userId, friendId})
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
      const result = await ProfileService.unblockUser({ unblockerId, blockedId });
      res.ok(USER_MESSAGES.USER_UNBLOCKED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProfileController;
