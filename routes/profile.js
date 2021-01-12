const {Router} = require('express')
const router = Router()
const User = require('../models/user')
const Post = require('../models/post')
const {isAuthorized} = require('../middlewares/auth')

router.get('/', isAuthorized, async (req, res) => {
	let posts = await Post
		.find({userId: req.user})
		.sort({date: 'desc'})
		.populate('userId', 'name avatarUrl')
		.lean() // Transforming mongoose object to json

	res.render('profile', {
		title: 'Профіль',
		user: req.user.toObject(),
		posts,
		success: req.flash('success')
	})
})

router.post('/', isAuthorized, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)

		const toChange = {
			avatarUrl: req.file ? req.file.path : user.avatarUrl,
			status: req.body.status ? req.body.status : user.status
		}

		Object.assign(user, toChange)
		await user.save()

		req.flash('success', 'Інформація профілю успішно змінена!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
