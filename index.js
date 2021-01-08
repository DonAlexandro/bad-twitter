const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const exhbs = require('express-handlebars')
const homeRoutes = require('./routes/home')
const authRoutes = require('./routes/auth')
const keys = require('./keys')

const app = express()

const hbs = exhbs.create({
	defaultLayout: 'main',
	extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

app.use('/', homeRoutes)
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000

async function start() {
	try {
		await mongoose.connect(keys.MONGODB_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useFindAndModify: false
		})

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	} catch (e) {
		console.trace(e)
	}
}

start()
