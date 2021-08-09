const crypto = require('crypto'); // Built in model.
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [ true, 'Please tell us your name' ], //Validator
		trim: true // Unnecessary spaces will be removed from both ends of the string
	},
	email: {
		type: String,
		required: [ true, 'Please provide an email address' ], //Validator
		unique: true,
		trim: true, // Unnecessary spaces will be removed from both ends
		lowercase: true, // Converts string into lowercase.
		validate: [ validator.isEmail, 'Please provide a valid email address' ]
	},
	photo: {
		type: String,
		default: 'default.jpg'
	},
	role: {
		type: String,
		enum: [ 'user', 'admin' ], // you will always have a different name for the roles according to the app you are making.
		default: 'user'
	},
	password: {
		type: String,
		required: [ true, 'Please provide a password' ], //Validator
		trim: true,
		minlength: 8,
		select: false // The select works only in case when we read documents from the database it won't work while creating or saving a document in database.
	},
	confirmPassword: {
		type: String,
		required: [ true, 'Please confirm your Password' ], //Validator
		validate: {
			// This only works on .save() and .create() !!! user.save can be also used to update something
			validator: function(el) {
				return el === this.password; // check if the current element which is confirm password is equal to the password.
			},
			message: 'Password is not the same!'
		}
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		// Tells if the user has deactivated his/her account or not.
		type: Boolean,
		default: true,
		select: false
	}
});

// Document Middleware
userSchema.pre('save', async function(next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next(); // this refers to the current document and isModified is method of mongoose to basically know if a property has been updated recently or not.

	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12); 

	// Delete confirmPassword field
	this.confirmPassword = undefined; // This is a required input.. This is not actually be required to persisted to database.
	next();
});

userSchema.pre('save', function(next) {
	// Checks for if the password is modified while changing the password or while creating a new account.
	if (!this.isModified('password') || this.isNew) return next(); // isNew is a mongoose boolean flag specifying if the document is new.

	this.passwordChangedAt = Date.now() - 1000; 
	next();
});

// Query Middleware
userSchema.pre(/^find/, function(next) {
	// This is a regex expression to select every type of find query that the app has been using, and this points to current query.
	this.find({ active: { $ne: false } }); // All documents where active is not equal to false should show up
	next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword); // compares the normal password against hashed password.
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

		return JWTTimestamp < changedTimestamp; // 100 < 200
	}

	return false;
};

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex'); // Never store reset token in databases for security purposes. This would be like a otp.

	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
