import type { Plugin } from 'graphql-yoga'

import type { GlobalContext } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

/**
 * {@link Plugin Yoga Plugin} which provides an extended {@link db Prisma Client} to the {@link GlobalContext}, associating the client's transactions to the `currentUser`. This association includes:
 *
 * * The current user's `tenantId`.
 * * The current user's `id`.
 *
 * If a user has not been authenticated (i.e., the application is being accessed anonymously), the client will *not* be extended and will be added as-is.
 */
export const useDbAuthConfig = (): Plugin<GlobalContext> => {
  return {
    onContextBuilding: ({ context, extendContext }) => {
      const prisma = db.$extends((client) => {
        //
        if (!context.currentUser) return

        return client.$extends({
          query: {
            $allModels: {
              async $allOperations({ args, query }) {
                const [, , result] = await client.$transaction([
                  client.$executeRaw`SELECT set_config(\'app.tenantId\', ${context?.currentUser?.tenantId}, TRUE)`,
                  client.$executeRaw`SELECT set_config(\'app.userId\', ${context?.currentUser?.id}, TRUE)`,
                  query(args),
                ])

                return result
              },
            },
          },
        })
      })

      extendContext({ prisma })
    },
  }
}
