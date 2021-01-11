const {Router} = require('express')
const router = Router()
const {isAuthorized} = require('../middlewares/auth')

router.get('/', isAuthorized, (req, res) => {
	res.render('home', {
		title: 'Головна сторінка',
		isHome: true,
		success: req.flash('success'),
		user: req.user.toObject()
	})
})

module.exports = router
