const { test, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test.only('retrieving notes as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
})

test.only('there are three blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 3)
})

after(async () => {
  mongoose.connection.close()
})
