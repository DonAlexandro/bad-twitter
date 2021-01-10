exports.isAuthorized= function (req, res, next) {
	if (!req.session.isAuthenticated) {
		return res.redirect('/auth/login')
	}

	next()
}

exports.isGuest = function (req, res, next) {
	if (req.session.isAuthenticated) {
		return res.redirect('/')
	}

	next()
}
