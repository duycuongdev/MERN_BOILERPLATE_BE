import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'

/**
 * Dual-Auth Middleware:
 * Validates accessToken extracted from either:
 * 1. HttpOnly Cookies (for standard desktop browsers)
 * 2. Authorization Header as 'Bearer <token>' (for mobile browsers / cross-site requests that block cookies)
 */
const isAuthorized = async (req, res, next) => {
  let clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken && req.headers?.authorization?.startsWith('Bearer ')) {
    clientAccessToken = req.headers.authorization.split(' ')[1]
  }

  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Access token not found.'))
    return
  }

  try {
    const accessTokenDecoded = await jwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    const user = await userModel.findOneById(accessTokenDecoded._id)
    if (!user || user._destroy || !user.isActive) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'User not found or account is deactivated!'))
      return
    }

    req.jwtDecoded = accessTokenDecoded
    req.currentUser = user

    next()
  } catch (error) {
    // If token expired, return 410 (GONE) so frontend knows to trigger the silent refresh_token flow
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need refresh token: Access token has expired.'))
      return
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Invalid token.'))
  }
}

export const authMiddleware = {
  isAuthorized
}

