const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const {isAuthorized} = require('../middlewares/auth')
const Comment = require('../models/comment')
const {commentValidator} = require('../utils/validators')
const url = require('url')

const isOwner = (comment, req) => {
	return comment.userId.toString() === req.user._id.toString()
}

const redirect = (res, postId, projectId) => {
	return postId ? res.redirect(`/posts/${postId}`) : res.redirect(`/projects/${projectId}`)
}

router.post('/add', isAuthorized, commentValidator, async (req, res) => {
	const postId = req.body.postId
	const projectId = req.body.projectId

	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		redirect(res, postId, projectId)
	}

	const comment = new Comment({
		text: req.body.text,
		date: Date.now(),
		userId: req.user,
		projectId,
		postId
	})

	try {
		await comment.save()
		req.flash('success', 'Коментар додано!')

		redirect(res, postId, projectId)
	} catch (e) {
		console.trace(e)
	}
})

router.post('/remove', async (req, res) => {
	try {
		const projectId = req.body.projectId
		const postId = req.body.postId

		await Comment.deleteOne({
			_id: req.body.id,
			userId: req.user._id
		})

		redirect(res, postId, projectId)
	} catch (e) {
		console.trace(e)
	}
})

router.post('/edit', isAuthorized, commentValidator, async (req, res) => {
	const postId = req.body.postId
	const projectId = req.body.projectId
	const {id} = req.body

	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		redirect(res, postId, projectId)
	}

	try {
		delete req.body.id

		const comment = await Comment.findById(id)

		if (!isOwner(comment, req)) {
			req.flash('error', 'Ви не можете редагувати цей відгук')
			redirect(res, postId, projectId)
		}

		const toChange = {
			text: req.body.text
		}

		Object.assign(comment, toChange)

		await comment.save()

		redirect(res, postId, projectId)
	} catch (e) {
		console.trace(e)
	}
})

router.post('/reply', isAuthorized, commentValidator, async (req, res) => {
	const postId = req.body.postId
	const projectId = req.body.projectId

	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		redirect(res, postId, projectId)
	}

	const replyingComment = await Comment.findById(req.body.id).populate('userId', 'name')

	const comment = new Comment({
		text: req.body.text,
		date: Date.now(),
		userId: req.user,
		projectId,
		postId,
		replyTo: {
			name: replyingComment.userId.name,
			commentId: replyingComment._id
		}
	})

	try {
		await comment.save()

		redirect(res, postId, projectId)
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
