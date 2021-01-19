module.exports = {
	ifeq(a, b, options) {
		if (a == b) {
			return options.fn(this)
		}

		return options.inverse(this)
	},
	includes(arr, item) {
		return arr.some(elem => elem.userId.toString() == item.toString())
	},
	currentDate() {
		return new Date().getFullYear()
	}
}
