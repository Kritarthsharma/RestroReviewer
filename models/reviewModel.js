const mongoose = require('mongoose');
const Restro = require('./restroModel');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [ true, 'Review can not be empty!' ]
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		createdAt: {
			type: Date,
			default: Date.now,
			select: false
		},
		restro: {
			type: mongoose.Schema.ObjectId,
			ref: 'Restro',
			required: [ true, 'Review must belong to a restaurant.' ]
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [ true, 'Review must belong to a user.' ]
		}
	},
	{
		toJSON: { virtuals: true }, // This makes sure when we have a VIRTUAL PROPERTY basically a field that is not stored in the database but calculated using some other value so we want this to also show up whenever there is a output.
		toObject: { virtuals: true }
	}
);

reviewSchema.index({ restro: 1, user: 1 }, { unique: true });

// Query Middleware
reviewSchema.pre(/^find/, function(next) {
	this.populate({
		path: 'user',
		select: 'name photo'
	});

	next();
});

reviewSchema.statics.calcAverageRatings = async function(restroId) {
	const stats = await this.aggregate([
		{
			$match: { restro: restroId } 
		},
		{
			$group: {
				_id: '$restro', // groups all the matched reviews together
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	]); 

	//console.log(stats);
	if (stats.length > 0) {
		await Restro.findByIdAndUpdate(restroId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating
		});
	} else {
		await Restro.findByIdAndUpdate(restroId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5
		});
	}
};

//Document Middleware ....// using post here because this calculation will work only when the document is saved to the database not before that.
reviewSchema.post('save', function() {
	//this points to the current review being saved.
	this.constructor.calcAverageRatings(this.restro);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
	this.r = await this.findOne(); 
});

reviewSchema.post(/^findOneAnd/, async function() {
	await this.r.constructor.calcAverageRatings(this.r.restro);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
