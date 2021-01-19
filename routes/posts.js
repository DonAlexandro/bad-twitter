const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const Post = require('../models/post')
const Comment = require('../models/comment')
const {postValidator} = require('../utils/validators')
const {isAuthorized} = require('../middlewares/auth')

const isOwner = (post, req) => {
	return post.userId.toString() === req.user._id.toString()
}

router.get('/create', (req, res) => {
	res.render('post/form', {
		title: 'Створити допис',
		user: req.user.toObject(),
		error: req.flash('error')
	})
})

router.post('/', isAuthorized, postValidator, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(422).render('post/form', {
			title: 'Створити допис',
			user: req.user.toObject(),
			error: errors.array()[0].msg,
			post: {
				title: req.body.title,
				text: req.body.text,
				category: req.body.category,
				tags: req.body.tags
			}
		})
	}

	const tags = req.body.tags !== '' ? req.body.tags.split(',') : undefined

	const post = new Post({
		title: req.body.title,
		category: req.body.category,
		tags,
		text: req.body.text,
		date: Date.now(),
		userId: req.user,
		likes: []
	})

	try {
		await post.save()
		req.flash('success', 'Допис успішно створено!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

router.post('/remove', isAuthorized, async (req, res) => {
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

router.get('/:id', isAuthorized, async (req, res) => {
	try {
		const post = await Post
			.findById(req.params.id)
			.populate('userId')
			.lean()

		if (post) {
			const comments = await Comment
				.find({postId: post._id})
				.populate('userId', 'name avatarUrl')
				.populate('replyTo')
				.lean()

			res.render('post/single', {
				title: post.title,
				user: req.user.toObject(),
				userId: req.user._id.toString(),
				success: req.flash('success'),
				error: req.flash('error'),
				comments,
				post
			})
		} else {
			// redirect to 404
		}
	} catch (e) {
		console.trace(e)
	}
})

router.get('/:id/edit', isAuthorized, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).lean()

		if (post) {
			if (!isOwner(post, req)) {
				req.flash('error', 'Ви не можете редагувати цей допис')
				return res.redirect(`/posts/${req.params.id}`)
			}

			res.render('post/form', {
				title: `Редагувати допис "${post.title}"`,
				user: req.user.toObject(),
				post,
				error: req.flash('error')
			})
		} else {
			// Redirect to 404
		}
	} catch (e) {
		console.trace(e)
	}
})

router.post('/edit', isAuthorized, postValidator, async (req, res) => {
	const errors = validationResult(req)
	const {id} = req.body

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		return res.status(422).redirect(`/posts/${id}/edit`)
	}

	try {
		delete req.body.id

		const post = await Post.findById(id)

		if (!isOwner(post, req)) {
			req.flash('error', 'Ви не можете редагувати цей допис')
			return res.redirect(`/posts/${id}`)
		}

		const toChange = {
			...req.body,
			tags: req.body.tags ? req.body.tags.split(',') : undefined
		}

		Object.assign(post, toChange)

		await post.save()

		req.flash('success', 'Допис успішно відредаговано!')
		res.redirect(`/posts/${id}`)
	} catch (e) {
		console.trace(e)
	}
})

router.post('/like/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)

		await post.addLike(req.user._id)
		res.status(200).json({likes: post.likes, userId: req.user._id.toString()})
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
