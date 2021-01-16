const {Router} = require('express')
const router = Router()
const User = require('../models/user')
const Post = require('../models/post')
const Project = require('../models/project')
const {isAuthorized} = require('../middlewares/auth')

router.get('/', isAuthorized, async (req, res) => {
	let posts = await Post
		.find({userId: req.user})
		.sort({date: 'desc'})
		.populate('userId', 'name avatarUrl')
		.lean() // Transforming mongoose object to json

	let projects = await Project
		.find({userId: req.user})
		.sort({date: 'desc'})
		.populate('userId', 'name avatarUrl')
		.lean()

	res.render('profile', {
		title: 'Профіль',
		user: req.user.toObject(),
		userId: req.user._id.toString(),
		posts,
		projects,
		success: req.flash('success'),
		error: req.flash('error'),
		isProfile: true
	})
})

router.post('/', isAuthorized, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)

		const toChange = {
			name: req.body.name ? req.body.name : user.name,
			avatarUrl: req.files ? req.files['avatar'][0].path : user.avatarUrl,
			status: req.body.status ? req.body.status : user.status,
			overview: req.body.overview ? req.body.overview : user.overview,
			location: req.body.location ? req.body.location : user.location,
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
