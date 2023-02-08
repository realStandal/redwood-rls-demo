import type { Plugin } from 'graphql-yoga'

import type { GlobalContext } from '@redwoodjs/graphql-server'

import { db, getAuthDb } from 'src/lib/db'

/**
 * A {@link Plugin Yoga Plugin} which extends the {@link GlobalContext} by adding an authenticated Prisma Client. If a user has not been authenticated (i.e., the application is being accessed anonymously), the client will *not* be extended and will be added as-is.
 */
export const usePrismaAuth = (): Plugin<GlobalContext> => {
  return {
    onContextBuilding: ({ context, extendContext }) => {
      extendContext({
        prisma: !context.currentUser
          ? db
          : getAuthDb({
              tenantId: context?.currentUser?.tenantId,
              userId: context?.currentUser?.id,
            }),
      })
    },
  }
}
