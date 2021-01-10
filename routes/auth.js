const {Router} = require('express')
const router = Router()
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const User = require('../models/user')
const {signupValidator, loginValidator, passwordValidator} = require('../utils/validators')
const confirmEmail = require('../emails/signup')
const resetEmail = require('../emails/reset')
const {isGuest} = require('../middlewares/auth')

const transporter = nodemailer.createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: 'ffab2da33d4287',
		pass: 'b3496b4ecdbccd'
	}
})

router.get('/login', isGuest, (req, res) => {
	res.render('auth/auth', {
		layout: 'auth',
		title: 'Авторизація',
		success: req.flash('success'),
		error: req.flash('error'),
		helpers: require('../utils/hbs-helper')
	})
})

router.post('/login', loginValidator, async (req, res) => {
	try {
		const {email} = req.body

		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			req.flash('error', errors.array()[0].msg)
			return res.status(422).redirect('/auth/login')
		}

		const user = await User.findOne({email})

		req.session.user = user
		req.session.isAuthenticated = true

		req.session.save(err => {
			if (err) throw err

			req.flash('success', 'З поверненням!')
			res.redirect('/')
		})
	} catch (e) {
		console.trace(e)
	}
})

router.post('/signup', signupValidator, async (req, res) => {
	try {
		const {email, password, name} = req.body

		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			req.flash('error', errors.array()[0].msg)
			return res.status(422).redirect('/auth/login')
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = new User({email, password: hashedPassword, name})

		await user.save()

		req.flash('success', 'Ви успішно зареєструвалися! Подальші інструкції вислані вам на пошту')

		res.redirect('/auth/login')

		await transporter.sendMail(confirmEmail(email, name, user._id))
	} catch (e) {
		console.trace(e)
	}
})

router.post('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/auth/login')
	})
})

router.get('/confirm/:id', isGuest, async (req, res) => {
	if (!req.params.id) {
		return res.redirect('/auth/login')
	}

	try {
		const user = await User.findById(req.params.id)

		if (!user) {
			req.flash('error', 'Акаунт для підтвердження не знайдено')
			return res.redirect('/auth/login')
		} else if (user.emailVerified === true) {
			req.flash('success', 'Ви вже підтвердили свій акаунт')
			return res.redirect('/auth/login')
		} else {
			Object.assign(user, {emailVerified: true})

			await user.save()

			req.flash('success', 'Акаунт успішно підтверджено! Тепер можете входити і насолоджуватися нашим сервісом сповна')
			return res.redirect('/auth/login')
		}
	} catch (e) {
		console.trace(e)
	}
})

router.get('/recovery', isGuest, (req, res) => {
	res.render('auth/recovery', {
		layout: 'auth',
		title: 'Відновлення паролю',
		error: req.flash('error')
	})
})

router.post('/recovery', (req, res) => {
	crypto.randomBytes(32, async (err, buffer) => {
		if (err) {
			req.flash('error', 'Щось пішло не так, повторіть спробу пізніше')
			return res.redirect('/auth/recovery')
		}

		const token = buffer.toString('hex')

		const user = await User.findOne({email: req.body.email})

		if (user) {
			user.resetToken = token
			user.resetTokenExp = Date.now() + 60 * 60 * 1000

			await user.save()

			req.flash('success', 'Вам на пошту висланий лист з подальшими інструкціями')

			await transporter.sendMail(resetEmail(user.email, user.name, token))

			return res.redirect('/auth/login')
		} else {
			req.flash('error', 'Користувача з таким ел. адресом не знайдено')
			return res.redirect('/auth/recovery')
		}
	})
})

router.get('/password/:token', isGuest, async (req, res) => {
	if (!req.params.token) {
		return res.redirect('/auth/login')
	}

	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: {$gt: Date.now()}
		})

		if (!user) {
			return res.redirect('/auth/login')
		} else {
			res.render('auth/password', {
				layout: 'auth',
				title: 'Введіть новий пароль',
				userId: user._id.toString(),
				token: req.params.token,
				error: req.flash('error')
			})
		}
	} catch (e) {
		console.trace(e)
	}
})

router.post('/password', passwordValidator, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		req.flash('error', errors.array()[0].msg)
		return res.redirect(`/auth/password/${req.body.token}`)
	}

	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: {$gt: Date.now()}
		})

		if (user) {
			user.password = await bcrypt.hash(req.body.password, 10)
			user.resetToken = undefined
			user.resetTokenExp = undefined

			await user.save()

			req.flash('success', 'Пароль успішно змінений!')
			return res.redirect('/auth/login')
		} else {
			req.flash('error', 'Унікальний одноразовий токен не є дійсним')
			return res.redirect('/auth/login')
		}
	} catch (e) {
		console.trace(e)
	}
})

module.exports = router
