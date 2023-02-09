import type { Prisma, Tenant } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.TenantCreateArgs>({
  tenant: {
    one: {
      data: { updatedAt: '2023-02-09T19:50:47.358Z', name: 'String2080757' },
    },
    two: {
      data: { updatedAt: '2023-02-09T19:50:47.358Z', name: 'String8405799' },
    },
  },
})

export type StandardScenario = ScenarioData<Tenant, 'tenant'>
