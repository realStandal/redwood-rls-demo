const { getDMMF } = require('@prisma/internals')

const { db } = require('./src/lib/db')

const { dbSchemaPath } = global.__RWJS__TEST_IMPORTS

let TEARDOWN_ORDER = []

beforeAll(async () => {
  const schema = await getDMMF({ datamodelPath: dbSchemaPath })
  TEARDOWN_ORDER = schema.datamodel.models.map((m) => m.dbName || m.name)
})

afterEach(async () => {
  await db.$executeRawUnsafe('BEGIN')
  await db.$executeRawUnsafe("SELECT set_config('app.bypass', 'on', TRUE)")
  for (const modelName of TEARDOWN_ORDER) {
    await db.$executeRawUnsafe(`DELETE FROM "${modelName}"`)
  }
  await db.$executeRawUnsafe('COMMIT')
})
