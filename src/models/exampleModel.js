import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { pagingSkipValue } from '~/utils/algorithms'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const EXAMPLE_COLLECTION_NAME = 'examples'
const EXAMPLE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(100).trim().strict(),
  description: Joi.string().optional().allow('').max(500).trim().strict(),
  status: Joi.string().valid('draft', 'active', 'archived').default('active'),
  userId: Joi.string().required(), // Owner/Author of this resource

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await EXAMPLE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(EXAMPLE_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(EXAMPLE_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      _destroy: false
    })
  } catch (error) { throw new Error(error) }
}

const getList = async ({ userId, page = DEFAULT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, queryFilters = {} }) => {
  try {
    const query = {
      _destroy: false,
      ...(userId ? { userId: userId.toString() } : {})
    }

    if (queryFilters.q) {
      query.title = { $regex: new RegExp(queryFilters.q, 'i') }
    }

    if (queryFilters.status) {
      query.status = queryFilters.status
    }

    const pageNum = parseInt(page, 10) || DEFAULT_PAGE
    const limitNum = parseInt(itemsPerPage, 10) || DEFAULT_ITEMS_PER_PAGE
    const skipNum = pagingSkipValue(pageNum, limitNum)

    const [items, total] = await Promise.all([
      GET_DB().collection(EXAMPLE_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .toArray(),
      GET_DB().collection(EXAMPLE_COLLECTION_NAME).countDocuments(query)
    ])

    return {
      items,
      total,
      page: pageNum,
      itemsPerPage: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  } catch (error) { throw new Error(error) }
}

const update = async (id, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    return await GET_DB().collection(EXAMPLE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
  } catch (error) { throw new Error(error) }
}

const softDelete = async (id) => {
  try {
    return await GET_DB().collection(EXAMPLE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { _destroy: true, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
  } catch (error) { throw new Error(error) }
}

export const exampleModel = {
  EXAMPLE_COLLECTION_NAME,
  EXAMPLE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getList,
  update,
  softDelete
}

