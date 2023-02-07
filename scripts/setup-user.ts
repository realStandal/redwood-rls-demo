import { db } from 'api/src/lib/db'
import c from 'chalk'
import prompts from 'prompts'

/**
 * Creates a new Postgres user which can be used to access a database while respecting RLS policies. This is particularly useful when accessing the database on behalf of user of the application who should only have access to their data and not other user's.
 */
export default async () => {
  console.log("\n🐘 Create a Postgres user which doesn't bypass RLS.\n")

  const { database, hasDatabase, password, name } = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Enter a name for the new user',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter a password for the user',
    },
    {
      type: 'select',
      name: 'hasDatabase',
      message: 'Is there an existing database this user should have access to?',
      choices: [
        { title: 'Yes', value: 'yes' },
        { title: 'No', value: 'no' },
      ],
    },
    {
      type: (_, values) => (values.hasDatabase === 'yes' ? 'text' : null),
      name: 'database',
      message: 'What is the name of the existing database?',
    },
  ])

  if (typeof name !== 'string' || typeof password !== 'string') {
    console.log('\nScript has quit, no user was created.\n')
    process.exit(1)
  }

  if (name === '' || password === '') {
    console.log(
      '\nA "username" and "password" are required to create a user.\n'
    )
    process.exit(1)
  }

  await db.$transaction(
    [
      db.$executeRawUnsafe(`CREATE USER ${name} WITH PASSWORD '${password}'`),
      db.$executeRawUnsafe(`ALTER USER ${name} CREATEDB`),
      hasDatabase === 'yes' &&
        db.$executeRawUnsafe(
          `GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${name}`
        ),
    ].filter(Boolean)
  )

  console.log(
    c.bold(
      `\n${c.green('✔')} The "${name}" user has been successfully created.`
    )
  )

  console.log(
    c.cyan(
      `\n${c.bold(
        'Important:'
      )} This user should be used to access your database on behalf of your application's users.\n`
    )
  )
}
