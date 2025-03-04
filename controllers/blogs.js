const notesRouter = require('express').Router()
// const { request, response } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const assignedUser = await User.findOne({})

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: assignedUser,
  })

  const savedBlog = await blog.save()
  assignedUser.blogs = assignedUser.blogs.concat(savedBlog._id)
  await assignedUser.save()
  response.status(201).json(savedBlog)
})

notesRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.patch('/:id', async (request, response) => {
  const { id } = request.params
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { likes },
    { new: true, runValidators: true }
  )

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

module.exports = notesRouter
