import { paths } from 'src/routes/paths'

// API
// ----------------------------------------------------------------------
export const ENV = process.env.NODE_ENV || 'development'

export const HOST_API = process.env.NEXT_PUBLIC_BACK_END_API_URL || 'http://localhost:3000'

export const BACKEND_APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY

export const AUTH0_API = {
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  callbackUrl: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL,
  audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
}

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root // as '/dashboard'

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
