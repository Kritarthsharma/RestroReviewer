class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		// BUILD QUERY
		// 1A) Filtering
		const queryObj = { ...this.queryString };
		const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
		excludedFields.forEach((el) => delete queryObj[el]);

		//1B) Advanced Filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // Converts the normal gte into a $gte for mongodb query.
		this.query = this.query.find(JSON.parse(queryStr)); //.where('ratingsAverage').gte(4.8); //find method returns an array of all the objects

		return this;
	}

	sort() {
		// 2) Sorting
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			// const sortBy = request.query.sort.replace(/,/g, ' ')
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
			// query.sort({ _id: -1 });
		}

		return this;
	}

	limitFields() {
		// 3) Field Limiting or projection
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v'); // minus sign denotes show everything except __v field or it excludes it.
		}

		return this;
	}

	paginate() {
		// 4) Pagination
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 10;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
