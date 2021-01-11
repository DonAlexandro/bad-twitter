var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(toastEl => new bootstrap.Toast(toastEl))

document.querySelectorAll('.date').forEach(node => {
	node.textContent = new Intl.DateTimeFormat('uk-UA', {
		dateStyle: 'long',
		timeStyle: 'short'
	}).format(new Date(node.textContent))
})
