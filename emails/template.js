const Mailgen = require('mailgen')
const keys = require('../keys')

module.exports = function (mail) {
	const mailGenerator = new Mailgen({
		theme: 'default',
		product: {
			name: 'Bad Twitter',
			link: keys.BASE_URL,
			copyright: `© ${new Date().getFullYear()} <a href="${keys.BASE_URL}">Bad Twitter</a>. Всі права захищені`
		}
	})

	return mailGenerator.generate(mail)
}
