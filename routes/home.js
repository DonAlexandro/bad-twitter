const {Router} = require('express')
const router = Router()
const {isAuthorized} = require('../middlewares/auth')
const Post = require('../models/post')
const Project = require('../models/project')
const User = require('../models/user')

router.get('/', isAuthorized, async (req, res) => {
	try {
		const posts = await Post
			.find()
			.populate('userId', 'name avatarUrl')
			.sort({likes: 'desc'})
			.limit(5)
			.lean()

		const projects = await Project
			.find()
			.populate('userId', 'name avatarUrl')
			.sort({date: 'desc'})
			.lean()

		const users = await User
			.find()
			.limit(10)
			.lean()

		res.render('home', {
			title: 'Головна сторінка',
			isHome: true,
			success: req.flash('success'),
			user: req.user.toObject(),
			userId: req.user._id.toString(),
			posts,
			projects,
			users
		})
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
