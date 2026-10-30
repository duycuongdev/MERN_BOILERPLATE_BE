import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '../utils/validators.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only JPG, JPEG and PNG formats are accepted.'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }
  return callback(null, true)
}

// Memory storage engine keeps files in RAM buffer ready for Cloudinary uploadStream
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

const uploadAttachment = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: (req, file, callback) => {
    return callback(null, true)
  }
})

export const multerUploadMiddleware = {
  upload,
  uploadAttachment
}

