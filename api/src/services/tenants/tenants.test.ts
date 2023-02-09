import type { Tenant } from '@prisma/client'

import {
  tenants,
  tenant,
  createTenant,
  updateTenant,
  deleteTenant,
} from './tenants'
import type { StandardScenario } from './tenants.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('tenants', () => {
  scenario('returns all tenants', async (scenario: StandardScenario) => {
    const result = await tenants()

    expect(result.length).toEqual(Object.keys(scenario.tenant).length)
  })

  scenario('returns a single tenant', async (scenario: StandardScenario) => {
    const result = await tenant({ id: scenario.tenant.one.id })

    expect(result).toEqual(scenario.tenant.one)
  })

  scenario('creates a tenant', async () => {
    const result = await createTenant({
      input: { updatedAt: '2023-02-09T19:50:47.345Z', name: 'String7829421' },
    })

    expect(result.updatedAt).toEqual(new Date('2023-02-09T19:50:47.345Z'))
    expect(result.name).toEqual('String7829421')
  })

  scenario('updates a tenant', async (scenario: StandardScenario) => {
    const original = (await tenant({ id: scenario.tenant.one.id })) as Tenant
    const result = await updateTenant({
      id: original.id,
      input: { updatedAt: '2023-02-10T19:50:47.345Z' },
    })

    expect(result.updatedAt).toEqual(new Date('2023-02-10T19:50:47.345Z'))
  })

  scenario('deletes a tenant', async (scenario: StandardScenario) => {
    const original = (await deleteTenant({
      id: scenario.tenant.one.id,
    })) as Tenant
    const result = await tenant({ id: original.id })

    expect(result).toEqual(null)
  })
})
