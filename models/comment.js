const {Schema, model} = require('mongoose')

const commentSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	text: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true,
	},
	postId: {
		type: Schema.Types.ObjectId,
		ref: 'Post'
	},
	projectId: {
		type: Schema.Types.ObjectId,
		ref: 'Project'
	},
	replyTo: Schema.Types.ObjectId
})

module.exports = model('Comment', commentSchema)
