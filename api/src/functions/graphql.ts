import { authDecoder } from '@redwoodjs/auth-dbauth-api'
import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { getCurrentUser } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { usePrismaAuth } from 'src/plugins/prisma-auth'

export const handler = createGraphQLHandler({
  authDecoder,
  getCurrentUser,
  directives,
  sdls,
  services,
  loggerConfig: { logger, options: {} },
  extraPlugins: [usePrismaAuth()],
  onException: () => {
    db.$disconnect()
  },
})
