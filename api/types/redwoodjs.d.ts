import type { getAuthDb } from 'src/lib/db'

declare module '@redwoodjs/graphql-server' {
  interface GlobalContext {
    prisma: ReturnType<typeof getAuthDb>
  }
}
