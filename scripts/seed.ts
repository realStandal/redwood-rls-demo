import { faker } from '@faker-js/faker'
import { bypassDb, getAuthDb } from 'api/src/lib/db'

import { hashPassword } from '@redwoodjs/auth-dbauth-api'

const [hashedPassword, salt] = hashPassword('123')

export default async () => {
  try {
    const tenantA = await bypassDb.tenant.create({
      data: {
        name: 'ACME Corp.',
      },
    })

    const tenantADb = getAuthDb({ tenantId: tenantA.id })

    const [userA1, userA2] = await Promise.all([
      tenantADb.user.create({
        data: {
          username: 'A1',
          hashedPassword,
          salt,
        },
      }),
      tenantADb.user.create({
        data: {
          username: 'A2',
          hashedPassword,
          salt,
        },
      }),
    ])

    const userA1Db = getAuthDb({ tenantId: tenantA.id, userId: userA1.id })
    const userA2Db = getAuthDb({ tenantId: tenantA.id, userId: userA2.id })

    await Promise.all([
      userA1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userA1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userA1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userA1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userA2Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
    ])

    // --

    const tenantB = await bypassDb.tenant.create({
      data: {
        name: 'ABC Inc.',
      },
    })

    const tenantBDb = getAuthDb({ tenantId: tenantB.id })

    const [userB1, userB2] = await Promise.all([
      tenantBDb.user.create({
        data: {
          username: 'B1',
          hashedPassword,
          salt,
        },
      }),
      tenantBDb.user.create({
        data: {
          username: 'B2',
          hashedPassword,
          salt,
        },
      }),
    ])

    const userB1Db = getAuthDb({ tenantId: tenantB.id, userId: userB1.id })
    const userB2Db = getAuthDb({ tenantId: tenantB.id, userId: userB2.id })

    await Promise.all([
      userB1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userB1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userB1Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userB2Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
      userB2Db.post.create({
        data: {
          body: faker.lorem.paragraph(),
          title: faker.vehicle.vehicle(),
        },
      }),
    ])
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
