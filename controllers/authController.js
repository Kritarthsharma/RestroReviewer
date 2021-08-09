// All the functions that are related to user authentication are here.

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	res.cookie('jwt', token, {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
	});

	//Remove Password from output.
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword
		// passwordChangedAt: req.body.passwordChangedAt,
		// role: req.body.role
	});
	const url = `${req.protocol}://${req.get('host')}/me`;
	// console.log(url);
	await new Email(newUser, url).sendWelcome(); // sendWelcome is an async function.

	createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) Check if email and password exists.
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400));
	}
	// 2) Check if user exists and password is correct.
	const user = await User.findOne({ email }).select('+password'); // password is hidden so we have to select it to bring out the password

	if (!user || !await user.correctPassword(password, user.password)) {
		return next(new AppError('Incorrect email or password', 401));
	}

	// 3) If everything is Ok, then send token to the client.
	createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
	res.cookie('jwt', 'logged out', {
		expires: new Date(Date.now() + 10 * 1000), // 10 seconds
		httpOnly: true
	});
	res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
	// Checks if the user has logged in before accessing routes.
	// 1) Getting token and check if it's there.
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		// authenticate users based on tokens sent via cookies.
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new AppError('You are not logged in! please login to get access.', 401));
	}

	// 2) Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		next(new AppError('The user belonging to this token does no longer exist.', 401));
	}
	// 4) Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('User recently changed password! Please log in again.', 401));
	}

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser; // the user data is saved in req object. This step is very crucial in order for next step to work correctly.
	res.locals.user = currentUser; //each and every pug template has access to response.locals..
	next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
	if (req.cookies.jwt === 'logged out') return next();
	if (req.cookies.jwt) {
		// 1) verify the token
		const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET); // This also needs a callback function but to overcome that we have used promisify module. Basically turning it into a promise function. The jwt.verify is an asynchronous function
		// 2) Check if user still exists
		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return next();
		}
		// 3) Check if user changed password after the token was issued
		if (currentUser.changedPasswordAfter(decoded.iat)) {
			return next();
		}

		// THERE IS A LOGGED IN USER
		res.locals.user = currentUser; //each and every pug template has access to response.locals..
		return next();
	}
	next(); // if there is no cookie there is no logged in user and hence the next will be executed directly.
});

exports.restrictTo = (...roles) => (req, res, next) => {
	// roles is an array ["admin", "lead-guide"] closure function and rest operator converts the given arguments into an array.
	if (!roles.includes(req.user.role)) {
		return next(new AppError('You do not have permission to perform this action', 403));
	}
	next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on Posted email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('There is no user with that email address.', 404));
	}
	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false }); // this deactivates all the validator in schema before saving a file.

	// 3) Send it to user's email
	try {
		// const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
		const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/?${resetToken}`;
		await new Email(user, resetURL).sendPasswordReset();

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!'
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('There was an error sending the email. Try again later!', 500));
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }); // finds user and also checks if the token time hasn't expired yet

	// 2) If token has not expired, and there is a user, set the new password.
	if (!user) {
		return next(new AppError('Token is invalid or expired!', 400));
	}
	user.password = req.body.password;
	user.confirmPassword = req.body.confirmPassword;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// 3) Update passwordChangedAt property for the user
	// 4) Log the user in, send the json web token to the client.
	createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user._id).select('+password');
	// 2) Check if posted current password is correct
	if (!await user.correctPassword(req.body.currentPassword, user.password)) {
		return next(new AppError('Current password is incorrect, Please provide the correct password', 401));
	}
	// 3) If the given password is correct, start updating the password
	user.password = req.body.password;
	user.confirmPassword = req.body.confirmPassword;
	await user.save();

	// User.findByIdAndUpdate would not work in this case because the validation in confirmPassword only works on create and save and not on this method. And also the pre save middlewares would not work.

	// 4) Log the user in, send JWT
	createSendToken(user, 200, req, res);
});
