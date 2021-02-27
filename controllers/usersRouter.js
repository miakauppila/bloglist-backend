const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!body.password) {
    return response.status(400).json({ error: 'password missing' })
  }
  else if (body.password.length < 3) {
    return response.status(400).json({ error: 'password minimum length is 3' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error) // pass error to errorHandler middleware
  }
})

usersRouter.get('/', async (request, response) => {
  // populate blogs field in User with content of each id
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })

  response.json(users.map(user => user.toJSON()))
})

module.exports = usersRouter