const notesRouter = require('express').Router()
const { response } = require('../app')
const Blog = require('../models/blog')

notesRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

notesRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  })

  blog
    .save()
    .then((result) => {
      response.status(201).json(result)
    })
    .catch((error) => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

module.exports = notesRouter
