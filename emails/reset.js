const keys = require('../keys')
const template = require('./template')

module.exports = function (email, name, token) {
	const mail = {
		body: {
			title: `Привіт, ${name}`,
			intro: 'З твого акаунта надійшов запит на відновлення паролю',
			action: {
				instructions: 'Жми на кнопку і гайда! :)',
				button: {
					color: '#DC3545',
					text: 'Відновити пароль',
					link: `${keys.BASE_URL}/auth/password/${token}`
				}
			},
			outro: 'Якщо це був не ти, проігноруй дане повідомлення',
			signature: false
		}
	}

	return {
		from: keys.ADMIN_EMAIL,
		to: email,
		subject: 'Відновлення паролю на Bad Twitter',
		html: template(mail)
	}
}