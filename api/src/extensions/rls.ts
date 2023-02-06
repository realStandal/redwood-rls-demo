import { Prisma } from '@prisma/client'

export const rls = (tenantId: string) => {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ args, query }) => {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`,
              query(args),
            ])
            return result
          },
        },
      },
    })
  })
}
