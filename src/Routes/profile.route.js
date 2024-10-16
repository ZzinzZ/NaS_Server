const express = require('express');
const upload = require("../middlewares/cloudinaryMiddleware");
const authMiddleware = require('../middlewares/authMiddleware');
const ProfileController = require('../Controllers/profile.controller');

const router = express.Router();
//create profile
router.post('/', upload.fields([{ name: 'avatar' }, { name: 'background' }]), authMiddleware, ProfileController.createProfile);
//get profile
router.get('/find_by_userId/:userId', ProfileController.getProfileByUserId);
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
router.put('/friends/unfriend/:userId', ProfileController.unfriendUser);
//block user
router.put('/friends/block/:blockerId', authMiddleware, ProfileController.blockUser);
//unblock user
router.put('/friends/unblock/:unblockerId', authMiddleware, ProfileController.unblockUser);
//get list of friends
router.get('/friends/list/:userId', authMiddleware, ProfileController.getListFriend);

//get list of friends request
router.get('/friends/requests/:userId', ProfileController.getListFriendRequest);
//get list of friends request sent
router.get('/friends/requests-sent/:userId', ProfileController.getListFriendRequestSent)

//add experience
router.post('/experience/:userId', ProfileController.addExperience);
//edit experience
router.patch('/experience/:userId', authMiddleware, ProfileController.editExperience);
//delete experience
router.delete('/experience/:userId', authMiddleware, ProfileController.deleteExperience);

//add education
router.post('/education/:userId', authMiddleware, ProfileController.addEducation);
//edit education
router.patch('/education/:userId', authMiddleware, ProfileController.editEducation);
//delete education
router.delete('/education/:userId', authMiddleware, ProfileController.deleteEducation);

//add location 
router.post('/location/:userId', authMiddleware, ProfileController.addLocation);
//edit location
router.patch('/location/:userId', authMiddleware, ProfileController.editLocation);
//delete location
router.delete('/location/:userId', authMiddleware, ProfileController.deleteLocation);
//edit profile relationships
router.patch('/relationship/:userId', authMiddleware, ProfileController.editProfileRelationship);
//search user
router.post('/search', ProfileController.searchProfiles);


module.exports = router;