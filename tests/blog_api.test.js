const mongoose = require('mongoose')
const helper = require('./api_test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[2])
    await blogObject.save()
})

describe("retrieve blogs (GET)", () => {

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body.length).toBe(helper.initialBlogs.length)
    })

    test('returned blog contains id property', async () => {
        const response = await api.get('/api/blogs')

        const blog = response.body[0]
        console.log('id test')

        expect(blog.id).toBeDefined();
    })

})

describe("adding a new blog (POST)", () => {

    test('a new blog with valid data can be added', async () => {
        const newBlog = {
            title: "Testi blogi",
            author: "Kirjoittaja",
            url: "www.bloginen.com",
            likes: 35
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)

        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
        expect(titles).toContain(
            'Testi blogi'
        )
    })

    test('likes are set to zero when not specified', async () => {
        const newBlog = {
            title: "Tarina blogi",
            author: "Tarinoija",
            url: "www.tarinoita.com",
        }

        const postResponse = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        console.log(postResponse.body)
        expect(postResponse.body.likes).toBe(0)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)

        // const likesArray = response.body.map(r => r.likes)
        // console.log(likesArray)
        // expect(likes[likesArray.length - 1]).toBe(0)
    })

    test('a new blog without title can not be added ', async () => {
        const newBlog = {
            author: "Kirjoittaja",
            url: "www.bloginen.com",
            likes: 35
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a new blog without url can not be added ', async () => {
        const newBlog = {
            title: "Urliton blogi",
            author: "Kirjoittaja",
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a new blog without title and url can not be added', async () => {
        const newBlog = {
            author: "Kirjoittaja",
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
})

describe("removing a blog (DELETE)", () => {

    test('blog is removed from db when id is valid', async () => {
        //retrieves the blogs so id can be accessed
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length - 1
        )

        const titles = blogsAtEnd.map(blog => blog.title)
        console.log(titles)

        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe("changing the data of a blog (PUT)", () => {

    test('data changed with success when id is valid', async () => {
        //retrieves the blogs so id can be accessed
        const blogsAtStart = await helper.blogsInDb()
        const blogToChange = blogsAtStart[0]

        const changedBlogData = {
            author: 'Corrected name',
            likes: 33,
        }
        //merge old and new data
        const expectedReturnValue = { ...blogToChange, ...changedBlogData }

        const putResponse = await api
            .put(`/api/blogs/${blogToChange.id}`)
            .send(changedBlogData)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(putResponse.body).toEqual(expectedReturnValue);

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

})

afterAll(() => {
    mongoose.connection.close()
})