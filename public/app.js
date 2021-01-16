var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(toastEl => new bootstrap.Toast(toastEl))

const toDate = (date, time) => {
	return new Intl.DateTimeFormat('uk-UA', {
		dateStyle: 'long',
		[time && 'timeStyle']: 'short'
	}).format(new Date(date))
}

const toCurrency = number => new Intl.NumberFormat('uk-UA', {
	currency: 'UAH',
	style: 'currency'
}).format(Number(number))

document.querySelectorAll('.date').forEach(node => {
	node.textContent = toDate(node.textContent, true)
})

document.querySelectorAll('.short-date').forEach(node => {
	node.textContent = toDate(node.textContent, false)
})

document.querySelectorAll('.price').forEach(node => {
	node.textContent = toCurrency(node.textContent)
})
