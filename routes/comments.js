const {Router} = require('express')
const router = Router()
const Post = require('../models/post')
const {isAuthorized} = require('../middlewares/auth')

router.post('/add', isAuthorized, async (req, res) => {
	const id = req.body.postId

	const post = await Post.findById(id)

	post.addComment({
		userId: req.user,
		text: req.body.text,
		date: Date.now()
	})

	res.redirect(`/posts/${id}`)
})

module.exports = router
