import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

import mongoose from 'mongoose'
const DATABASE_URL = process.env.DATABASE_URL
mongoose.connect(DATABASE_URL)

import userRouter from './routes/user.js'
app.use('/user', userRouter)

import passwordRouter from './routes/password.js'
app.use('/password', passwordRouter)

import courseRouter from './routes/course.js'
app.use('/course', courseRouter)

import chapterRouter from './routes/chapter.js'
app.use('/chapter', chapterRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`)
})