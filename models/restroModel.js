const mongoose = require('mongoose');
const slugify = require('slugify');

const restroSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [ true, 'A restaurant must have a name' ], 
			unique: true,
			trim: true,
			maxlength: [ 40, 'A restaurant name must have less or equal than 40 characters' ]
		},
		slug: String,
		neighborhood: {
			type: String,
			required: [ true, 'A restaurant must have a neighborhood' ]
		},
		timings: {
			type: String,
			required: [ true, 'A restaurant must have timings' ]
		},
		openingDays: {
			type: String,
			required: [ true, 'A restaurant must have opening Days' ],
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [ 1, 'Rating must be equal or above 1.0' ], 
			max: [ 5, 'Rating must be equal or below 5.0' ],
			set: (val) => Math.round(val * 10) / 10 
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [ true, 'A restaurant must have a price' ]
		},
		phoneNumber: Number,
		website: String,
		cuisine: {
			type: String,
			trim: true,
			required: [ true, 'A restaurant must have a cuisine' ]
		},
		imageCover: {
			type: String,
			required: [ true, 'A restaurant must have a cover image' ]
		},
		images: [ String ],
		createdAt: {
			type: Date,
			default: Date.now(), 
			select: false
		},
		location: {
			type: String,
			required: [ true, 'A restaurant must have a location' ]
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

restroSchema.index({ price: 1, ratingsAverage: -1 }); 
restroSchema.index({ slug: 1 }); 


// Virtual populate
restroSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'restro', 
	localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
restroSchema.pre('save', function(next) {
	// Pre save hook or middleware
	this.slug = slugify(this.name, { lower: true });
	next();
});

const Restro = mongoose.model('Restro', restroSchema); // the variable name is defined in uppercase letter so that we can know that it is a model

module.exports = Restro;
