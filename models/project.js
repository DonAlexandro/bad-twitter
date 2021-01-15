const {Schema, model} = require('mongoose')

const projectSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	price: Number,
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	img: String,
	date: {
		type: Date,
		required: true
	}
})

module.exports = model('Project', projectSchema)
