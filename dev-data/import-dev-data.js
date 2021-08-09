// 1) START THE SERVER
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restro = require('../models/restroModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
console.log(DB);

mongoose
	//.connect(process.env.DATABASE_LOCAL, {
	// Local server
	.connect(DB, {
		// Hosted server
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB connection successful'));

// READ JSON FILE
const restro = JSON.parse(fs.readFileSync(`${__dirname}/restro.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
	try {
		await Restro.create(restro);
		await User.create(users, { validateBeforeSave: false }); // Turn of all the validation before importing or saving documents to the db. We have also turned off password encryption in user model.
		await Review.create(reviews);
		console.log('Data successfully loaded!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
	try {
		await Restro.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('Data successfully deleted!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
}
