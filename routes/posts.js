const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const Post = require('../models/post')
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
		req.flash('error', errors.array()[0].msg)
		return res.redirect('/posts/create')
	}

	const tags = req.body.tags !== '' ? req.body.tags.split(',') : undefined

	const post = new Post({
		title: req.body.title,
		category: req.body.category,
		tags,
		text: req.body.text,
		date: Date.now(),
		userId: req.user,
		comments: {items: []}
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
			.populate('comments.items.userId', 'name avatarUrl')
			.lean()

		if (post) {
			res.render('post/single', {
				title: post.title,
				user: req.user.toObject(),
				success: req.flash('success'),
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

module.exports = router
