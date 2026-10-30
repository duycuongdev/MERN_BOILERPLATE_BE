import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { exampleModel } from '~/models/exampleModel'

const createNew = async (userId, reqBody) => {
  try {
    const newItem = {
      ...reqBody,
      userId: userId.toString()
    }
    const createdItem = await exampleModel.createNew(newItem)
    return await exampleModel.findOneById(createdItem.insertedId)
  } catch (error) { throw error }
}

const getDetails = async (id) => {
  try {
    const item = await exampleModel.findOneById(id)
    if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Item not found!')
    return item
  } catch (error) { throw error }
}

const getList = async ({ userId, page, itemsPerPage, q, status }) => {
  try {
    return await exampleModel.getList({
      userId,
      page,
      itemsPerPage,
      queryFilters: { q, status }
    })
  } catch (error) { throw error }
}

const update = async (id, userId, reqBody) => {
  try {
    const existing = await exampleModel.findOneById(id)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Item not found!')
    if (existing.userId !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update this item!')
    }

    return await exampleModel.update(id, reqBody)
  } catch (error) { throw error }
}

const deleteItem = async (id, userId) => {
  try {
    const existing = await exampleModel.findOneById(id)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Item not found!')
    if (existing.userId !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this item!')
    }

    await exampleModel.softDelete(id)
    return { deleteResult: 'Item deleted successfully!' }
  } catch (error) { throw error }
}

export const exampleService = {
  createNew,
  getDetails,
  getList,
  update,
  deleteItem
}

