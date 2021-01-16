const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const {projectValidator} = require('../utils/validators')
const Project = require('../models/project')
const {isAuthorized} = require('../middlewares/auth')

const isOwner = (req, project) => {
	return req.user._id.toString() === project.userId.toString()
}

router.get('/create', (req, res) => {
	res.render('project/form', {
		title: 'Додати проєкт',
		user: req.user.toObject(),
		error: req.flash('success')
	})
})

router.post('/', isAuthorized, projectValidator, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(422).render('project/form', {
			title: 'Додати проєкт',
			user: req.user.toObject(),
			error: errors.array()[0].msg,
			data: {
				projectTitle: req.body.projectTitle,
				price: req.body.price,
				description: req.body.description,
			}
		})
	}

	const img = req.files['projectImg'] ? req.files['projectImg'][0].path : undefined

	const project = new Project({
		title: req.body.title,
		price: req.body.price,
		description: req.body.description,
		img,
		userId: req.user,
		date: Date.now()
	})

	try {
		await project.save()
		req.flash('success', 'Проєкт успішно додано!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

router.get('/:id', async (req, res) => {
	try {
		const project = await Project
			.findById(req.params.id)
			.populate('userId')
			.lean()

		res.render('project/single', {
			title: project.title,
			user: req.user.toObject(),
			success: req.flash('success'),
			project
		})
	} catch (e) {
		console.trace(e)
	}
})

router.post('/remove', isAuthorized, async (req, res) => {
	try {
		await Project.deleteOne({
			_id: req.body.id,
			userId: req.user._id
		})

		req.flash('success', 'Проєкт успішно видалено!')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})


router.get('/:id/edit', isAuthorized, async (req, res) => {
	try {
		const project = await Project
			.findById(req.params.id)
			.lean()

		if (!isOwner(req, project)) {
			req.flash('error', 'Ви не можете редагувати цей проєкт')
			return res.redirect('/profile')
		}

		res.render('project/form', {
			title: `Редагувати проєкт "${project.title}"`,
			user: req.user.toObject(),
			error: req.flash('error'),
			project
		})
	} catch (e) {
		console.trace(e)
	}
})

router.post('/edit', isAuthorized, projectValidator, async (req, res) => {
	const errors = validationResult(req)
	const {id} = req.body

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		return res.redirect(`/projects/${id}/edit`)
	}

	try {
		delete req.body.id

		const project = await Project.findById(id)

		if (!isOwner(req, project)) {
			req.flash('error', 'Ви не можете редагувати цей проєкт')
			return res.redirect('/profile')
		}

		const toChange = {
			...req.body,
			img: req.files['projectImg'] ? req.files['projectImg'][0].path : project.img
		}

		Object.assign(project, toChange)

		await project.save()

		req.flash('success', 'Проєкт успішно відредаговано')
		res.redirect('/profile')
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
