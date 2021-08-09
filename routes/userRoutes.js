/* eslint-disable */

const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword); // receives the email password
router.patch('/resetPassword/:token', authController.resetPassword); // receives the token and new password.

// Should be authenticated to use these features.

router.use(authController.protect); // This will protect all the routes that come after this point.

router.patch('/updateMyPassword', authController.updatePassword); // Updates the password while user logged in.
router.get('/me', userController.getMe, userController.getSingleUser); // Get info about yourself while logged in.
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe); // Updates the password while user logged in.
router.delete('/deleteMe', userController.deleteMe); // Updates the password while user logged in.

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createNewUser);
router
	.route('/:id/:y?')
	.get(userController.getSingleUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
