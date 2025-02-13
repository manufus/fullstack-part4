const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const notesRouter = require('./controllers/blogs')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', notesRouter)

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
