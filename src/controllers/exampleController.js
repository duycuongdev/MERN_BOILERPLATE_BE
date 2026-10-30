import { StatusCodes } from 'http-status-codes'
import { exampleService } from '~/services/exampleService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const item = await exampleService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(item)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const item = await exampleService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(item)
  } catch (error) { next(error) }
}

const getList = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?._id
    const { page, itemsPerPage, q, status } = req.query
    const result = await exampleService.getList({ userId, page, itemsPerPage, q, status })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updated = await exampleService.update(req.params.id, userId, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await exampleService.deleteItem(req.params.id, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const exampleController = {
  createNew,
  getDetails,
  getList,
  update,
  deleteItem
}

