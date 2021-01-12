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
	comments: {
		items: [
			{
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
					required: true
				}
			}
		]
	}
})

postSchema.methods.addComment = function (comment) {
	this.comments.items.push(comment)

	return this.save()
}

module.exports = model('Post', postSchema)
