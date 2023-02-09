import type { getAuthDb } from 'api/src/lib/db'

declare module '@redwoodjs/graphql-server' {
  interface GlobalContext {
    /**
     * When a request is made by an authenticated user, this will be an [extended Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions) which is associated with the user and its tenant. When a request is made by an anonymous user, the default Prisma Client is included instead.
     */
    prisma: ReturnType<typeof getAuthDb>
  }
}
