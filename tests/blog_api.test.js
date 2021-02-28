const mongoose = require('mongoose')
const helper = require('./api_test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  // create initial user
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('secret', 10)
  const initialUser = new User({ username: 'root', name: 'admin', passwordHash })
  await initialUser.save()

  // create initial blogs with initial user's id included
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  blogObject.user = initialUser._id
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  blogObject.user = initialUser._id
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[2])
  blogObject.user = initialUser._id
  await blogObject.save()
})

describe('retrieve blogs (GET)', () => {

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('returned blog contains id property', async () => {
    const response = await api.get('/api/blogs')

    const blog = response.body[0]
    expect(blog.id).toBeDefined()
  })

})

describe('adding a new blog (POST)', () => {

  test('a new blog without token can NOT be added', async () => {
    // unsuccessfull login with wrong password
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'wrongsecret'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
    // token is undefined
    const token = loginResponse.body.token
    expect(token).toBeUndefined()

    const newBlog = {
      title: 'Testi blogi',
      author: 'Kirjoittaja',
      url: 'www.bloginen.com',
      likes: 35
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a new blog with valid data can be added', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'secret'
      })
      .catch(error => console.log(error))
    //console.log(loginResponse.body)
    const token = loginResponse.body.token
    console.log(token)

    const newBlog = {
      title: 'Testi blogi',
      author: 'Kirjoittaja',
      url: 'www.bloginen.com',
      likes: 35
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain('Testi blogi')
  })

  test('likes of the blog are set to zero when not specified', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'secret'
      })
    const token = loginResponse.body.token

    const newBlog = {
      title: 'Tarina blogi',
      author: 'Tarinoija',
      url: 'www.tarinoita.com',
    }

    const postResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log(postResponse.body)
    expect(postResponse.body.likes).toBe(0)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('a new blog without title can not be added ', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'secret'
      })
    const token = loginResponse.body.token

    const newBlog = {
      author: 'Kirjoittaja',
      url: 'www.bloginen.com',
      likes: 35
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a new blog without url can not be added ', async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'secret'
      })
      .catch(error => console.log(error))
    const token = loginResponse.body.token

    const newBlog = {
      title: 'Urliton blogi',
      author: 'Kirjoittaja',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

})

describe('removing a blog (DELETE)', () => {

  test('blog is deleted from db when correct user makes the request', async () => {
    // successful login
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'secret'
      })
    const token = loginResponse.body.token

    //retrieves the blogs from db so id can be accessed
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('changing the data of a blog (PUT)', () => {

  test('data changed with success when blog id is valid', async () => {
    //retrieves the blogs so id can be accessed
    const blogsAtStart = await helper.blogsInDb()
    const blogToChange = blogsAtStart[0]

    const correctedBlogData = {
      author: 'Corrected name',
      likes: 33,
    }
    //merge old and new data
    const changedBlogData = { ...blogToChange, ...correctedBlogData }

    const putResponse = await api
      .put(`/api/blogs/${blogToChange.id}`)
      .send(correctedBlogData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(putResponse.body.author).toBe('Corrected name')
    expect(putResponse.body.likes).toBe(33)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0]).toEqual(changedBlogData)
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})