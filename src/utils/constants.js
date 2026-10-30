import { env } from '../config/environment.js'

// Whitelist domains for Production CORS
export const WHITELIST_DOMAINS = [
  env.WEBSITE_DOMAIN_PRODUCTION
].filter(Boolean)

export const WEBSITE_DOMAINS = (env.BUILD_MODE === 'dev')
  ? env.WEBSITE_DOMAIN_DEVELOPMENT
  : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

