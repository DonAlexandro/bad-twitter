const {Router} = require('express')
const router = Router()
const {isAuthorized} = require('../middlewares/auth')
const Post = require('../models/post')

router.get('/', isAuthorized, async (req, res) => {
	try {
		const posts = await Post
			.find()
			.populate('userId', 'name avatarUrl')
			.sort({date: 'desc'})
			.lean()

		res.render('home', {
			title: 'Головна сторінка',
			isHome: true,
			success: req.flash('success'),
			user: req.user.toObject(),
			posts
		})
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
