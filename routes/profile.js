const {Router} = require('express')
const router = Router()
const User = require('../models/user')

router.get('/', (req, res) => {
	res.render('profile', {
		title: 'Профіль',
		user: req.user.toObject()
	})
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
