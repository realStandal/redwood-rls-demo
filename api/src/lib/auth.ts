import type { Decoded } from '@redwoodjs/api'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'

import { bypassDb } from 'src/lib/db'

type AllowedRoles = string | string[] | undefined

interface RequireAuthArgs {
  roles?: AllowedRoles
}

export const getCurrentUser = async (session: Decoded) => {
  if (!session || typeof session.id !== 'string')
    throw new AuthenticationError('Invalid authentication session')

  return bypassDb.user.findUnique({ where: { id: session.id } })
}

export const hasRole = (roles: AllowedRoles) => {
  if (!isAuthenticated()) return false

  const currentRoles = context.currentUser?.roles

  if (typeof roles === 'string') {
    if (typeof currentRoles === 'string') return currentRoles === roles

    if (Array.isArray(currentRoles))
      return currentRoles?.some((allowed) => roles === allowed)
  }

  if (Array.isArray(roles)) {
    if (Array.isArray(currentRoles))
      return currentRoles?.some((allowed) => roles.includes(allowed))

    if (typeof currentRoles === 'string')
      return roles.some((allowed) => currentRoles === allowed)
  }

  // roles not found
  return false
}

export const isAuthenticated = () => {
  return !!context.currentUser
}

export const requireAuth = ({ roles }: RequireAuthArgs) => {
  console.log(context.currentUser)

  if (!isAuthenticated())
    throw new AuthenticationError("You don't have permission to do that.")

  if (roles && !hasRole(roles))
    throw new ForbiddenError("You don't have access to do that.")
}
