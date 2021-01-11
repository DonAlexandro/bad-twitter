const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const Post = require('../models/post')
const {postValidator} = require('../utils/validators')

router.post('/create', postValidator, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(422).render('profile', {
			title: 'Профіль',
			user: req.user.toObject(),
			error: errors.array()[0].msg,
			data: {
				title: req.body.title,
				category: req.body.category,
				text: req.body.text,
				tags: req.body.tags
			}
		})
	}

	const tags = req.body.tags !== '' ? req.body.tags.split(', ') : undefined

	const post = new Post({
		title: req.body.title,
		category: req.body.category,
		tags,
		text: req.body.text,
		date: Date.now(),
		userId: req.user
	})

	try {
		await post.save()
		req.flash('success', 'Допис успішно створено!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

router.post('/remove', async (req, res) => {
	try {
		await Post.deleteOne({
			_id: req.body.id,
			userId: req.user._id
		})

		req.flash('success', 'Допис успішно видалено!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
