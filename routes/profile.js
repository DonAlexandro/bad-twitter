const {Router} = require('express')
const router = Router()
const User = require('../models/user')
const Post = require('../models/post')

router.get('/', async (req, res) => {
	let posts = await Post
		.find({userId: req.user})
		.populate('userId', 'name avatarUrl')
		.lean() // Transforming mongoose object to json

	res.render('profile', {
		title: 'Профіль',
		user: req.user.toObject(),
		posts,
		success: req.flash('success')
	})
})

router.post('/', async (req, res) => {
	try {

	} catch (e) {
		console.trace(e)
	}
})

router.post('/status', async (req, res) => {
	try {
		const user = await User.findById(req.body.userId)

		Object.assign(user, {status: req.body.status})

		await user.save()

		req.flash('success', 'Статус успішно змінено!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
