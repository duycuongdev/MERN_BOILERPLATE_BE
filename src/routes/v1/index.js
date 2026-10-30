import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from './userRoute'
import { exampleRoute } from './exampleRoute'

const Router = express.Router()

// Service health check route
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'APIs V1 are operational and ready to use.'
  })
})

// User & Authentication routes
Router.use('/users', userRoute)

// Example CRUD resource routes
Router.use('/examples', exampleRoute)

export const APIs_V1 = Router

