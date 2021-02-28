const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// route /api/blogs
blogsRouter.get('/', async (request, response) => {
  // populate user field in Blog with content of each id
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    }
    else {
      response.status(404).end()
    }
  }
  catch(error){
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }
  try {
    //decoded token includes username & id
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
    //search for the correct user
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    //add savedBlog to user's blogs array
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)

  }
  catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }
  try {
    //decoded token includes username & id
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
    //search for the correct user & blog
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)
    if(!blog) {
      return response.status(401).json({ error: 'blog does not exist' })
    }
    // blog.user is ObjectId so both must be converted to string
    else if (blog.user.toString() === user._id.toString()) {
      await Blog.deleteOne(blog)
      console.log('deleted blog')
      response.status(204).end() // no content returned
    }
    else {
      return response.status(401).json({ error: 'token not valid for this operation' })
    }
  }
  catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const changedBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, changedBlog,
      { new: true, omitUndefined: true }) //options: undefined fields will not be sent
    response.status(200).json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter