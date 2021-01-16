const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const exhbs = require('express-handlebars')
const session = require('express-session')
const fileMiddleware = require('./middlewares/file')
const MongoStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const varMiddleware = require('./middlewares/variables')
const userMiddleware = require('./middlewares/user')
const homeRoutes = require('./routes/home')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const projectRoutes = require('./routes/projects')
const hbsHelpers = require('./utils/hbs-helper')
const keys = require('./keys')

const app = express()

const hbs = exhbs.create({
	defaultLayout: 'main',
	extname: 'hbs',
	helpers: hbsHelpers
})

const store = MongoStore({
	collection: 'sessions',
	uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))

app.use(session({
	secret: keys.SESSION_KEY,
	resave: false,
	saveUninitialized: false,
	store
}))

app.use(fileMiddleware.fields([
	{name: 'avatar', maxCount: 1},
	{name: 'projectImg', maxCount: 1}
]))

app.use(csrf())
app.use(flash())

app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/posts', postRoutes)
app.use('/projects', projectRoutes)
app.use('/comments', commentRoutes)

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
