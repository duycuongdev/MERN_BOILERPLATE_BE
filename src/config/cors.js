import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const corsOptions = {
  origin: function (origin, callback) {
    // In development mode, allow all origins (including Postman/Thunder Client where origin is undefined)
    if (env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    // In production mode, verify whether origin matches whitelisted domains
    if (!origin || WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} is not allowed by CORS Policy.`))
  },
  optionsSuccessStatus: 200,
  // Required for receiving and sending cookies (HttpOnly tokens)
  credentials: true
}

