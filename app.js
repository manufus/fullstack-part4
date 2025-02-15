const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const notesRouter = require('./controllers/blogs')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
// app.use(express.static('dist')) // Para conectar el front end mas tarde
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', notesRouter)

app.use(middleware.unknownEndpoint) //Despues de todas las rutas
app.use(middleware.errorHandler)

module.exports = app
