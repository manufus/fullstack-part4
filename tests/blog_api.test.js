const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const blog = require('../models/blog')
const { title } = require('node:process')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Title test',
    author: 'Author 1',
    url: 'qwerty.1',
    likes: 1,
  },
  {
    title: 'Title 2',
    author: '2',
    url: 'yuiop.2',
    likes: 2,
  },
  {
    title: 'Title 3',
    author: '3',
    url: 'asdfg.3',
    likes: 3,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[2])
  await blogObject.save()
})

test('retrieving blogs as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
})

test('there are three blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog identifiers are id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  const existeId = blogs.map((blog) => Boolean(blog.id))
  assert(!existeId.includes(false))
})

test.only('new blog post is created', async () => {
  const newBlog = {
    title: 'POST test',
    author: 'Author 4',
    url: 'qwerty.4',
    likes: 4,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const response = await api.get('/api/blogs')
  // console.log(response.body[response.body.length - 1])
  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  const match = await Blog.find({ title: 'POST test' })
  console.log(match, '!!!!', match[0].id)

  await api.delete(`/api/blogs/${match[0].id}`).expect(204)
})

after(async () => {
  mongoose.connection.close()
})
