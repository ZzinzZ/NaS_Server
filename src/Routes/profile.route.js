const express = require('express');
const upload = require("../middlewares/cloudinaryMiddleware");
const authMiddleware = require('../middlewares/authMiddleware');
const ProfileController = require('../Controllers/profile.controller');

const router = express.Router();
//create profile
router.post('/', upload.fields([{ name: 'avatar' }, { name: 'background' }]), authMiddleware, ProfileController.createProfile);
//get profile
router.get('/find_by_userId/:userId', authMiddleware, ProfileController.getProfileByUserId);
router.get('/find_by_id/:profileId',authMiddleware, ProfileController.getProfileById);
// update profile
router.put('/update/:profileId',upload.fields([{ name: 'avatar' }, { name: 'background' }]), authMiddleware, ProfileController.updateProfile);
//follow 
router.put('/follow/:followedId',authMiddleware, ProfileController.followProfile);
//unfollow
router.put('/unfollow/:followedId',authMiddleware, ProfileController.unfollowProfile);
// send friend request
router.put('/friends/friend_request/:receptionId',authMiddleware, ProfileController.addFriendRequest);
// accept friend request
router.put('/friends/accept_friend_request/:receiverId',authMiddleware, ProfileController.acceptFriendRequest);
// reject friend request
router.put('/friends/reject_friend_request/:receiverId',authMiddleware, ProfileController.rejectFriendRequest);
// remove friend request
router.put('/friends/remove_friend_request/:receiverId',authMiddleware, ProfileController.removeFriendRequest);
//unfriend 
router.put('/friends/unfriend/:userId',authMiddleware, ProfileController.unfriendUser);
//block user
router.put('/friends/block/:blockerId', authMiddleware, ProfileController.blockUser);
//unblock user
router.put('/friends/unblock/:unblockerId', authMiddleware, ProfileController.unblockUser);


module.exports = router;