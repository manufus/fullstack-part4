const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const blog = require('../models/blog')

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

test.only('blog identifiers are id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  const existeId = blogs.map((blog) => Boolean(blog.id))
  assert(!existeId.includes(false))
})

after(async () => {
  mongoose.connection.close()
})
