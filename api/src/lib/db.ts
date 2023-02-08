import { PrismaClient } from '@prisma/client'

import { emitLogLevels, handlePrismaLogging } from '@redwoodjs/api/logger'

import { logger } from 'src/lib/logger'

interface GetAuthDbArgs {
  tenantId?: string
  userId?: string
}

/**
 * Bare-minimum {@link PrismaClient} with logging enabled.
 */
export const db = new PrismaClient({ log: emitLogLevels(['warn', 'error']) })

handlePrismaLogging({
  db,
  logger,
  logLevels: ['info', 'warn', 'error'],
})

/**
 * Extends the base {@link PrismaClient}, associating the given information with queries made using the returned client.
 *
 * @param tenantId The ID of the tenant to associate the client with.
 * @param userId The ID of the user to associate the client with.
 * @returns An extended {@link PrismaClient} which should be used to make request on behalf of the given user.
 */
export const getAuthDb = ({ tenantId, userId }: GetAuthDbArgs) => {
  return db.$extends((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, , result] = await client.$transaction([
              client.$executeRaw`SELECT set_config('app.tenantId', ${tenantId}, TRUE)`,
              client.$executeRaw`SELECT set_config('app.userId', ${userId}, TRUE)`,
              query(args),
            ])

            return result
          },
        },
      },
    })
  })
}

/**
 * Extends the base {@link PrismaClient}, allowing for queries which will bypass any row-level security policies which are configured to support it.
 *
 * @returns An extended {@link db Prisma Client} which can bypass any row-level security policies which support it.
 */
export const bypassDb = db.$extends((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, result] = await client.$transaction([
            client.$executeRaw`SELECT set_config('app.bypass', 'on', TRUE)`,
            query(args),
          ])

          return result
        },
      },
    },
  })
})
