const {Schema, model} = require('mongoose')

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	name: String,
	status: String,
	emailVerified: {
		type: Boolean,
		default: false
	},
	resetToken: String,
	resetTokenExp: Date,
	avatarUrl: String,
	date: {
		type: Date,
		required: true
	}
})

module.exports = model('User', userSchema)
