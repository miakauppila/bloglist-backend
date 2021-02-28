const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

//handle unknown routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.info(error.message)

  // get: /api/blogs/wrongId
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  // post: /api/users
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  // post: api/blogs
  else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  // get the content of Authorization in the header
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    //extract actual token (from position7 until the end of string)
    request.token = authorization.substring(7)
  }
  else {
    request.token = null
  }
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}