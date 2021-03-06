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

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }
  //decoded token includes username & id
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  //search for the correct user
  const user = await User.findById(decodedToken.id)
  // and set it as blog user
  blog.user = user

  // if likes were undefined in the request, set to 0
  if (!blog.likes) {
    blog.likes = 0
  }

  const savedBlog = await blog.save()
  //add savedBlog to user's blogs array
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }
  //decoded token includes username & id
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  //search for the correct user & blog
  const user = await User.findById(decodedToken.id)
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(401).json({ error: 'blog does not exist' })
  }
  // blog.user is ObjectId so both must be converted to string
  else if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete blogs' })
  }
  else {
    await Blog.deleteOne(blog)
    // user.blogs[x] is ObjectId
    user.blogs = user.blogs.filter(objId => objId.toString() !== request.params.id.toString())
    await user.save()
    response.status(204).end() // no content returned
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const changedBlog = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, changedBlog,
    { new: true, omitUndefined: true })
  //mongoose options: new: true returns the document after update
  // omitUndefined: undefined fields in the request deleted and not sent
  response.status(200).json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  // received commentObj {content: "some comment"}
  const newComment = request.body

  const blog = await Blog.findById(request.params.id)
  //add new comment to blog's comments array
  blog.comments.push(newComment)
  console.log('blog after adding comment:', blog)
  const savedBlog = await blog.save()
  response.status(200).json(savedBlog)
})

// blog's comments resource
blogsRouter.get('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const comments = blog.comments
  response.json(comments)
})

module.exports = blogsRouter