const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const helper = require('../utils/list_helper')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

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

  const blogObjects = initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
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

test('new blog post is created', async () => {
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

test('likes missing, adding 0 instead', async () => {
  const newBlog = {
    title: 'Likes defaulting 0 test',
    author: 'Author 4',
    url: 'qwerty.4',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('title or url missing returns 400 Bad Request', async () => {
  const newBlogNoTitleNoUrl = {
    author: 'Bad Request',
    likes: 33,
  }

  const newBlogNoUrl = {
    title: 'Test Title',
    author: 'Bad Request',
    likes: 33,
  }

  const newBlogNoTitle = {
    author: 'Bad Request',
    url: 'test.url',
    likes: 33,
  }

  // Test missing both title and url
  await api.post('/api/blogs').send(newBlogNoTitleNoUrl).expect(400)

  // Test missing url
  await api.post('/api/blogs').send(newBlogNoUrl).expect(400)

  // Test missing title
  await api.post('/api/blogs').send(newBlogNoTitle).expect(400)
})

test('deleting a blog', async () => {
  const response = await api.get('/api/blogs')
  const blogsStart = response.body
  const blogToDelete = blogsStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const responseAfter = await api.get('/api/blogs')
  const blogsEnd = responseAfter.body

  assert.strictEqual(blogsEnd.length, blogsStart.length - 1)
})

test('updating likes of a blog', async () => {
  const response = await api.get('/api/blogs')
  const blogsStart = response.body
  const blogToUpdate = blogsStart[0]

  const blogLikesUpdated = { ...blogToUpdate, likes: blogToUpdate.likes - 33 }

  await api
    .patch(`/api/blogs/${blogToUpdate.id}`)
    .send(blogLikesUpdated)
    .expect(200)

  const responseAfter = await api.get('/api/blogs')
  const blogsAfter = responseAfter.body
  const blogAfter = blogsAfter[0]

  assert.strictEqual(blogAfter.likes, blogToUpdate.likes - 33)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is shorter than 3', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'a',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    assert(
      result.body.error.includes('username must be longer than 3 characters')
    )
  })
  test('creation fails with proper statuscode and message if password is shorter than 3', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'aaaaa',
      password: '0',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    assert(
      result.body.error.includes('password must be longer than 3 characters')
    )
  })
})

after(async () => {
  mongoose.connection.close()
})
