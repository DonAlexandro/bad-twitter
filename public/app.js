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

document.querySelectorAll('.commentButton').forEach(node => {
	node.addEventListener('click', function() {
		const form = document.querySelector(`#form-${this.dataset.comment}`)
		const text = document.querySelector(`#text-${this.dataset.comment}`)

		form.classList.toggle('d-none')

		if (this.dataset.type) {
			form.action = '/comments/reply'
			form.firstElementChild.value = ''
			form.lastElementChild.textContent = 'Відповісти'
		} else {
			text.classList.toggle('d-none')

			form.action = '/comments/edit'
			form.firstElementChild.value = text.textContent
			form.lastElementChild.textContent = 'Редагувати'
		}
	})
})

const $footer = document.querySelector('#fullCardFooter')

if ($footer) {
	$footer.addEventListener('click', event => {
		if (event.target.classList.contains('like')) {
			const id = event.target.dataset.id
			const csrf = event.target.dataset.csrf

			fetch('/posts/like/' + id, {
				method: 'post',
				headers: {
					'X-XSRF-TOKEN': csrf
				}
			}).then(res => res.json()).then(data => {
				let html

				if (data.likes.some(like => like.userId == data.userId)) {
					event.target.classList.remove('btn-outline-danger')
					event.target.classList.add('btn-danger')
					html = `
						Не подобається
                    	<span class="badge bg-light text-danger ms-2">${data.likes.length}</span>
					`
				} else {
					event.target.classList.add('btn-outline-danger')
					event.target.classList.remove('btn-danger')
					html = `
						Подобається
                    	<span class="badge bg-danger ms-2">${data.likes.length}</span>
					`
				}

				event.target.innerHTML = html
			})
		}
	})
}
