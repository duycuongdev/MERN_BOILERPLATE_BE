import express from 'express'
import { exampleValidation } from '~/validations/exampleValidation'
import { exampleController } from '~/controllers/exampleController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// All example CRUD routes require user authorization
Router.use(authMiddleware.isAuthorized)

Router.route('/')
  .get(exampleController.getList)
  .post(exampleValidation.createNew, exampleController.createNew)

Router.route('/:id')
  .get(exampleValidation.validateId, exampleController.getDetails)
  .put(exampleValidation.validateId, exampleValidation.update, exampleController.update)
  .delete(exampleValidation.validateId, exampleController.deleteItem)

export const exampleRoute = Router

