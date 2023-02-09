import type { Prisma, Post } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.PostCreateArgs>({
  post: {
    one: {
      data: {
        updatedAt: '2023-02-09T19:43:16.474Z',
        title: 'String',
        body: 'String',
        user: {
          create: {
            updatedAt: '2023-02-09T19:43:16.474Z',
            username: 'String9428250',
            hashedPassword: 'String',
            salt: 'String',
            tenant: {
              create: {
                updatedAt: '2023-02-09T19:43:16.474Z',
                name: 'String430092',
              },
            },
          },
        },
        tenant: {
          create: {
            updatedAt: '2023-02-09T19:43:16.474Z',
            name: 'String2894452',
          },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2023-02-09T19:43:16.474Z',
        title: 'String',
        body: 'String',
        user: {
          create: {
            updatedAt: '2023-02-09T19:43:16.474Z',
            username: 'String3555489',
            hashedPassword: 'String',
            salt: 'String',
            tenant: {
              create: {
                updatedAt: '2023-02-09T19:43:16.474Z',
                name: 'String2155049',
              },
            },
          },
        },
        tenant: {
          create: {
            updatedAt: '2023-02-09T19:43:16.474Z',
            name: 'String9974160',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Post, 'post'>
