const {body} = require('express-validator')
const bcrypt = require('bcrypt')
const User = require('../models/user')

exports.signupValidator = [
	body('email')
		.isEmail().withMessage('Введіть коректний ел. адрес')
		.custom(async (value, {req}) => {
			try {
				const user = await User.findOne({email: value})

				if (user) {
					return Promise.reject('Ел. адрес вже зайнятий')
				}
			} catch (e) {
				console.trace(e)
			}
		})
		.normalizeEmail()
		.trim(),
	body('password')
		.isLength({min: 8}).withMessage('Мінімальна довжина паролю - 8 символів')
		.isAlphanumeric()
		.trim(),
	body('confirm')
		.custom((value, {req}) => {
			if (value !== req.body.password) {
				throw new Error('Паролі не співпадають')
			}

			return true
		})
		.trim(),
	body('name')
		.isLength({min: 2}).withMessage('Мінімальна довжина імені - 2 символи')
		.trim()
]

exports.loginValidator = [
	body('email')
		.isEmail().withMessage('Введіть коректний ел. адрес')
		.custom(async (value, {req}) => {
			try {
				const user = await User.findOne({email: value})

				if (!user) {
					return Promise.reject('Користувач з таким ел. адресом не зареєстрований')
				}
			} catch (e) {
				console.trace(e)
			}
		})
		.normalizeEmail()
		.trim(),
	body('password')
		.isLength({min: 8}).withMessage('Мінімальна довжина паролю - 8 символів')
		.isAlphanumeric()
		.custom(async (value, {req}) => {
			try {
				const user = await User.findOne({email: req.body.email})

				const isSame = await bcrypt.compare(value, user.password)

				if (!isSame) {
					return Promise.reject('Невірний пароль')
				}
			} catch (e) {
				console.trace(e)
			}
		})
		.trim()
]

exports.passwordValidator = [
	body('password')
		.isLength({min: 8}).withMessage('Мінімальна довжина паролю - 8 символів')
		.isAlphanumeric()
		.trim(),
	body('confirm')
		.custom((value, {req}) => {
			if (value !== req.body.password) {
				throw new Error('Паролі не співпадають')
			}

			return true
		})
		.trim(),
]

exports.postValidator = [
	body('title')
		.isLength({min: 1}).withMessage('Введіть заголовок допису')
		.trim(),
	body('category')
		.isLength({min: 1}).withMessage('Введіть категорію')
		.trim(),
	body('text')
		.isLength({min: 1}).withMessage('Напишіть будь-яке коротке або довге повідомлення')
		.trim(),
	body('tags')
		.trim()
]
