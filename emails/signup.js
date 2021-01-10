const keys = require('../keys')
const template = require('./template')

module.exports = function (email, name, id) {
	const mail = {
		body: {
			title: `Привіт, ${name}`,
			intro: 'Раді бачити на Bad Twitter - вільному твітері!',
			action: {
				instructions: 'Нажми на кнопку нижче, щоб в повній мірі дізнатися, що таке свобода слова:',
				button: {
					color: '#DC3545',
					text: 'Підтвердити акаунт',
					link: `${keys.BASE_URL}/auth/confirm/${id}`
				}
			},
			outro: 'Залишилися запитання? Просто дай відповідь на цей лист і ми залюбки допоможемо!',
			signature: false
		}
	}

	return {
		from: keys.ADMIN_EMAIL,
		to: email,
		subject: 'Підтверди акаунт на Bad Twitter',
		html: template(mail)
	}
}