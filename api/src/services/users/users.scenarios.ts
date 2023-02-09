import type { Prisma, User } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: {
      data: {
        updatedAt: '2023-02-09T19:45:40.883Z',
        username: 'String7903336',
        hashedPassword: 'String',
        salt: 'String',
        tenant: {
          create: {
            updatedAt: '2023-02-09T19:45:40.883Z',
            name: 'String9838382',
          },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2023-02-09T19:45:40.883Z',
        username: 'String776284',
        hashedPassword: 'String',
        salt: 'String',
        tenant: {
          create: {
            updatedAt: '2023-02-09T19:45:40.883Z',
            name: 'String4429087',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<User, 'user'>
