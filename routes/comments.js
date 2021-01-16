const {Router} = require('express')
const router = Router()
const {isAuthorized} = require('../middlewares/auth')
const Comment = require('../models/comment')

router.post('/add', isAuthorized, async (req, res) => {
	const postId = req.body.postId
	const projectId = req.body.projectId

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

		if (postId) {
			res.redirect(`/posts/${postId}`)
		} else {
			res.redirect(`/projects/${projectId}`)
		}
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

		if (projectId) {
			res.redirect(`/projects/${projectId}`)
		} else {
			res.redirect(`/posts/${postId}`)
		}
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
