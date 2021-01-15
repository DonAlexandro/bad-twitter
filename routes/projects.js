const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator')
const {projectValidator} = require('../utils/validators')
const Project = require('../models/project')
const {isAuthorized} = require('../middlewares/auth')

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
		title: req.body.projectTitle,
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

router.post('/remove', async (req, res) => {
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

module.exports = router
