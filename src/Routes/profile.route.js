const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const ProfileController = require("../Controllers/profile.controller");

const router = express.Router();
//create profile
router.post(
  "/",
  upload.fields([{ name: "avatar" }, { name: "background" }]),
  ProfileController.createProfile
);
//get profile
router.get("/find_by_userId/:userId", ProfileController.getProfileByUserId);
router.get("/find_by_id/:profileId", ProfileController.getProfileById);
// update profile
router.put(
  "/update/:profileId",
  upload.fields([{ name: "avatar" }, { name: "background" }]),
  ProfileController.updateProfile
);
//follow
router.put("/follow/:followedId", ProfileController.followProfile);
//unfollow
router.put("/unfollow/:followedId", ProfileController.unfollowProfile);
// send friend request
router.put(
  "/friends/friend_request/:receptionId",
  ProfileController.addFriendRequest
);
// accept friend request
router.put(
  "/friends/accept_friend_request/:receiverId",
  ProfileController.acceptFriendRequest
);
// reject friend request
router.put(
  "/friends/reject_friend_request/:receiverId",
  ProfileController.rejectFriendRequest
);
// remove friend request
router.put(
  "/friends/remove_friend_request/:receiverId",
  ProfileController.removeFriendRequest
);
//unfriend
router.put("/friends/unfriend/:userId", ProfileController.unfriendUser);
//block user
router.put("/friends/block/:blockerId", ProfileController.blockUser);
//unblock user
router.put("/friends/unblock/:unblockerId", ProfileController.unblockUser);
//get list of friends
router.get("/friends/list/:userId", ProfileController.getListFriend);

//get list of friends request
router.get("/friends/requests/:userId", ProfileController.getListFriendRequest);
//get list of friends request sent
router.get(
  "/friends/requests-sent/:userId",
  ProfileController.getListFriendRequestSent
);

//add experience
router.post("/experience/:userId", ProfileController.addExperience);
//edit experience
router.patch("/experience/:userId", ProfileController.editExperience);
//delete experience
router.delete("/experience/:userId", ProfileController.deleteExperience);

//add education
router.post("/education/:userId", ProfileController.addEducation);
//edit education
router.patch("/education/:userId", ProfileController.editEducation);
//delete education
router.delete("/education/:userId", ProfileController.deleteEducation);

//add location
router.post("/location/:userId", ProfileController.addLocation);
//edit location
router.patch("/location/:userId", ProfileController.editLocation);
//delete location
router.delete("/location/:userId", ProfileController.deleteLocation);
//edit profile relationships
router.patch(
  "/relationship/:userId",
  ProfileController.editProfileRelationship
);
//search user
router.post("/search", ProfileController.searchProfiles);

//get not friends profile
router.get("/unfriended/:userId", ProfileController.getUnfriendedProfiles);
//get suggested friends profile
router.get("/suggested/:userId", ProfileController.getSuggestedProfiles);

module.exports = router;
