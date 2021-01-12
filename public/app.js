var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(toastEl => new bootstrap.Toast(toastEl))

const toDate = (date, time) => {
	return new Intl.DateTimeFormat('uk-UA', {
		dateStyle: 'long',
		[time && 'timeStyle']: 'short'
	}).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
	node.textContent = toDate(node.textContent, true)
})

document.querySelectorAll('.short-date').forEach(node => {
	node.textContent = toDate(node.textContent, false)
})
