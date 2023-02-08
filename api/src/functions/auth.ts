import type { PrismaClient } from '@prisma/client'
import type { APIGatewayProxyEvent, Context } from 'aws-lambda'

import { DbAuthHandler } from '@redwoodjs/auth-dbauth-api'
import type { DbAuthHandlerOptions } from '@redwoodjs/auth-dbauth-api'

import { bypassDb } from 'src/lib/db'

export const handler = (event: APIGatewayProxyEvent, context: Context) => {
  const forgotPasswordOptions: DbAuthHandlerOptions['forgotPassword'] = {
    handler: (user) => user,

    expires: 60 * 60 * 24,

    errors: {
      usernameNotFound: 'Username not found',
      usernameRequired: 'Username is required',
    },
  }

  const loginOptions: DbAuthHandlerOptions['login'] = {
    handler: (user) => user,

    expires: 60 * 60 * 24 * 365 * 10,

    errors: {
      usernameOrPasswordMissing: 'Both username and password are required',
      usernameNotFound: 'Username ${username} not found',
      incorrectPassword: 'Username ${username} not found',
    },
  }

  const resetPasswordOptions: DbAuthHandlerOptions['resetPassword'] = {
    handler: (_user) => true,

    allowReusedPassword: false,

    errors: {
      resetTokenExpired: 'resetToken is expired',
      resetTokenInvalid: 'resetToken is invalid',
      resetTokenRequired: 'resetToken is required',
      reusedPassword: 'Must choose a new password',
    },
  }

  const signupOptions: DbAuthHandlerOptions['signup'] = {
    handler: async ({ username, hashedPassword, salt }) => {
      return bypassDb.user.create({
        data: {
          hashedPassword,
          salt,
          username,
        },
      })
    },

    passwordValidation: (_password) => {
      return true
    },

    errors: {
      // `field` will be either "username" or "password"
      fieldMissing: '${field} is required',
      usernameTaken: 'Username `${username}` already in use',
    },
  }

  const authHandler = new DbAuthHandler(event, context, {
    db: bypassDb as PrismaClient,

    authModelAccessor: 'user',

    authFields: {
      id: 'id',
      username: 'username',
      hashedPassword: 'hashedPassword',
      salt: 'salt',
      resetToken: 'resetToken',
      resetTokenExpiresAt: 'resetTokenExpiresAt',
    },

    // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies
    cookie: {
      HttpOnly: true,
      Path: '/',
      SameSite: 'Strict',
      Secure: process.env.NODE_ENV !== 'development',

      // Domain: 'example.com',
    },

    forgotPassword: forgotPasswordOptions,
    login: loginOptions,
    resetPassword: resetPasswordOptions,
    signup: signupOptions,
  })

  return authHandler.invoke()
}
