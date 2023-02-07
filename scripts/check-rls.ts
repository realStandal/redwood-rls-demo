import { db } from 'api/src/lib/db'
import c from 'chalk'

/**
 * The role used to connect to the database.
 */
interface CurrentRole extends Record<string, unknown> {
  rolname: string
  rolsuper: boolean
  rolbypassrls: boolean
}

/**
 * Performs a series of queries against the current database to see if
 */
export default async () => {
  const currentUsers = await db.$queryRaw`SELECT user`

  const currentUserName = currentUsers[0].user

  if (typeof currentUserName !== 'string') {
    console.log(
      c.redBright('\nError determining which user was used to log in.\n')
    )

    process.exit(1)
  }

  const currentRoles =
    await db.$queryRaw`SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = ${currentUserName}`

  const currentRole: CurrentRole = currentRoles[0]

  if (typeof currentRole === 'undefined') {
    console.log(c.redBright('\nError accessing the current user.\n'))

    process.exit(1)
  }

  switch (true) {
    case currentRole.rolbypassrls || currentRole.rolsuper: {
      console.log(
        `\n${c.redBright(
          '✕'
        )} The user you connected to your database with can bypass RLS policies.\n`
      )

      process.exit(1)
      break
    }

    default: {
      console.log(
        `\n${c.green(
          '✔'
        )} The user you connected to your database with will respect RLS policies.\n`
      )

      process.exit(0)
      break
    }
  }
}
