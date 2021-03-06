const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogsRouter')
const usersRouter = require('./controllers/usersRouter')
const loginRouter = require('./controllers/loginRouter')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

// Jest connection in each test file to avoid problems due to slow connection
if(!global.__JEST__) {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      logger.info('connected to MongoDB')
    })
    .catch((error) => {
      logger.error('error connecting to MongoDB:', error.message)
    })
}
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// handle defined routes
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

// testingRouter is used to reset test database in Cypress tests
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testingRouter')
  app.use('/api/testing', testingRouter)
}

// handle unknown routes and errors
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app