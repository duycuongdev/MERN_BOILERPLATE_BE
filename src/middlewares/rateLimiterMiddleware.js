import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'

// 1. Brute-force protection for login: 10 failed attempts within 15 mins per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  message: {
    message: 'Too many failed login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// 2. Spam protection for registration: 5 new accounts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  message: {
    message: 'Too many accounts created from this IP. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// 3. Global API rate limiter against scraping / DDoS: 600 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  message: {
    message: 'Too many requests from this IP. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const rateLimiterMiddleware = {
  loginLimiter,
  registerLimiter,
  apiLimiter
}

