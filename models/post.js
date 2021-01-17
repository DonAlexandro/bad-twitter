const {Schema, model} = require('mongoose')

const postSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	tags: Array,
	text: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	likes: [
		{
			userId: {
				type: Schema.Types.ObjectId,
				ref: 'User'
			}
		}
	]
})

postSchema.methods.addLike = function(userId) {
	const idx = this.likes.findIndex(like => like.userId.toString() === userId.toString())

	if (idx !== -1) {
		this.likes.splice(idx, 1)
	} else {
		this.likes.push({userId})
	}

	return this.save()
}

module.exports = model('Post', postSchema)
