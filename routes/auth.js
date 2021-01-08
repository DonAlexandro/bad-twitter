const {Router} = require('express')
const router = Router()

router.get('/login', async (req, res) => {
	res.render('auth/auth', {
		layout: 'auth',
		title: 'Авторизація'
	})
})

module.exports = router
