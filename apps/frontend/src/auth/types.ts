import { LogoutOptions, RedirectLoginOptions } from '@auth0/auth0-react'

// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key
      }
    : {
        type: Key
        payload: M[Key]
      }
}

export type AuthUserType = null | Record<string, any>

export type AuthStateType = {
  status?: string
  loading: boolean
  authUser: AuthUserType
}

// ----------------------------------------------------------------------

type CanRemove = {
  login: (options?: RedirectLoginOptions) => Promise<void>
  //
  forgotPassword?: (email: string) => Promise<void>
  newPassword?: (email: string, code: string, password: string) => Promise<void>
  updatePassword?: (password: string) => Promise<void>
}

// ----------------------------------------------------------------------

export type Auth0ContextType = CanRemove & {
  authUser: AuthUserType
  method: string
  loading: boolean
  authenticated: boolean
  unauthenticated: boolean
  logout: (options?: LogoutOptions) => Promise<void>
}
