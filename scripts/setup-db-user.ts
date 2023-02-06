import { db } from 'api/src/lib/db'
import c from 'chalk'
import prompts from 'prompts'

/**
 * Creates a new Postgres user which can be used to access a database without bypassing row-level security rules (i.e., it is *not* a root-user).
 * This is particularly useful when accessing the database on behalf of user of the application who should only have access to their data, not other user's.
 */
export default async () => {
  console.log('\n🐘 Create a Postgres user which does not bypass RLS.\n')

  const { database, hasDatabase, password, username } = await prompts([
    {
      type: 'text',
      name: 'username',
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

  if (typeof username !== 'string' || typeof password !== 'string') {
    console.log('\nScript has quit, no user was created.\n')
    process.exit(1)
  }

  if (username === '' || password === '') {
    console.log(
      '\nA "username" and "password" are required to create a user.\n'
    )
    process.exit(1)
  }

  console.log(`\n🌲 Creating the user and assigning it permissions.`)

  await db.$executeRaw`CREATE USER ${username} WITH PASSWORD ${password}`
  await db.$executeRaw`ALTER USER ${username} CREATEDB`
  if (hasDatabase === 'yes' && database !== '') {
    await db.$executeRaw`GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${username}`
  }

  console.log(
    c.bold(
      `\n${c.green('✔')} The "${username}" user has been successfully created.`
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
