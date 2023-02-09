<div align="center">
  <h1>🚣‍♀️&nbsp;&nbsp;&nbsp;RedwoodJS Postgres RLS</h1>
  <p>(a) Demonstration of Postgres row-level security in a RedwoodJS application</p>
  <br />
</div>

This repository provides a demonstration of how to use [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). This README is divided into two sections, with the second aiming to be a general set of instructions for adding RLS to any application.

* [Getting Started](#getting-started) with this repository.
* [Supporting RLS](#supporting-rls) in a RedwoodJS application.

## Getting Started

The following provides steps to clone and setup this repository on your development machine. The next section, [Supporting RLS](#supporting-rls), details the repository's components and how they work together.

### 0) Prerequisites

* See the [Redwood prerequisites](https://redwoodjs.com/docs/quick-start)
* Postgres database (one of)
  * [Docker](https://www.docker.com/products/docker-desktop/) - Used to run a short-lived Postgres container.
  * [Local installation](https://redwoodjs.com/docs/local-postgres-setup) - A tutorial from the RedwoodJS documentation on installing Postgres to your local machine.
  * ... - Your preferred method of accessing a Postgres database while developing applications.

### 1) Get the code

```bash
git clone https://github.com/realStandal/redwood-rls-demo.git
```

```bash
cd redwood-rls-demo
```

```bash
yarn install
```

### 2) Start or configure your database

Start your Postgres database and (optionally) configure the application to make use of its root user.

#### 2.1) Start the database container (Docker)

A [compose configuration](./docker-compose.yml) has been provided which will start and expose a Postgres container accessible using the username `postgres` and password `secret`.

```bash
docker compose up -d
```

#### 2.2) Update the connection string (non-Docker)

This demonstration has been setup with the assumption you will be running a database using the attached compose configuration. If you are not using it, you will need to create and configure a file named `.env` (or update `.env.defaults`) with an updated connection string.

```dotenv
DATABASE_URL=...
```

### 3) Migrate and seed your database

Once your database has started and the application is configured, apply all of the application's migrations.

```bash
yarn rw prisma migrate dev
```

After your database has been migrated, your can seed it using [the provided script](https://github.com/realStandal/redwood-rls-demo/blob/main/scripts/seed.ts).

```bash
yarn rw exec seed
```

This will create numerous `Tenants`, `Users`, and `Posts` for these users. All users and posts should only be accessible by members of the same tenant, as defined by [migrated security policies](https://github.com/realStandal/redwood-rls-demo/blob/main/api/db/migrations/20230208064740_add_rls_policies/migration.sql). Users of the same tenant should be able to view other users' post in the same tenant, but only the post's user can update and delete it.

* Password used by all users: `123`
* Tenant `A`
  * User `A1`
  * User `A2`
* Tenant `B`
  * User `B1`
  * User `B2`

## Supporting RLS

This section details supporting [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). These steps have been applied to this repository and are listed here to be generalized across applications.

### 1) Create a user which respects RLS policies

In order to use row-level security, a database needs to be connected to as a non-superuser which **does not** have the `BYPASSRLS` attribute. To check if the configured user will respect RLS policies, a [script](./scripts/check-rls.ts) has been included which does so and prints the results to the console. This script can be copy-and-pasted to your own application, depending only on tools provided by RedwoodJS.

```bash
yarn rw exec check-rls
```

To simplify creating a user which respects RLS policies, a [script](./scripts/setup-user.ts) has been included which will prompt you for a username, password, and whether or not there is an existing database the user should have access to. This script will use the database configured in `.env.defaults` or `.env` and **should** be ran by a superuser.

```bash
yarn rw exec setup-user
```

> **Warning**
>
> When accessing [Prisma Studio](https://www.prisma.io/studio) using a user which respects RLS policies, you may not have a complete view of your application's data.

Your application can then connect to your database using this user and ensure data is accessed according to any security policies. In the next section, we'll extend a Prisma Client to provide contextual information about a request which is making use of the client.

### 2) Extend the Prisma Client

In order to [extend a Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions), extensions need to be enabled as a preview feature in your database's schema.

```prisma
generator client {
  previewFeatures = ["clientExtensions"]
}
```

After, we can extend all queries, models, and operations by [setting a parameter on the current transaction](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET). We can then make use of this parameter in security policies and as the default value of columns inserted using the extended client. This is particularly useful for associating operations on the database with the user who made the request which triggered the operation. The following [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/api/src/lib/db.ts#L23) and demonstrates associating queries with two distinct values.

```TypeScript
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()

export const getAuthDb = ({ tenantId, userId }) => {
  return db.$extends((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, , result] = await client.$transaction([
              client.$executeRaw`SELECT set_config('app.tenantId', ${tenantId}, TRUE)`,
              client.$executeRaw`SELECT set_config('app.userId', ${userId}, TRUE)`,
              query(args),
            ])

            return result
          },
        },
      },
    })
  })
}
```

#### 2.1) Bypass client

It may also be useful to extend the Prisma Client in order to create a bypass client with security policies which allow for operations on the database outside the scope of a user. The following [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/api/src/lib/db.ts#L50) and [is provided to Redwood's dbAuth](https://github.com/realStandal/redwood-rls-demo/blob/7f4da2c7a4d2eb3dd53574b78e0125a3ca0e8c1a/api/src/functions/auth.ts#L69) which it can use to update users.

```TypeScript
export const bypassDb = db.$extends((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, result] = await client.$transaction([
            client.$executeRaw`SELECT set_config('app.bypass', 'on', TRUE)`,
            query(args),
          ])

          return result
        },
      },
    },
  })
})
```

### 3) Provide to the extended client to services

We can provide the extended client to all services by creating a [Yoga Plugin](https://the-guild.dev/graphql/yoga-server/docs/features/envelop-plugins) which extends the context of the request. If the user does not exist, or if the application is being accessed anonymously, the original client will be added instead. Like the other code samples, this one [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/api/src/plugins/prisma-auth.ts).

```TypeScript
import type { Plugin } from 'graphql-yoga'

import type { GlobalContext } from '@redwoodjs/graphql-server'

import { db, getAuthDb } from 'src/lib/db'

export const usePrismaAuth = (): Plugin<GlobalContext> => {
  return {
    onContextBuilding: ({ context, extendContext }) => {
      extendContext({
        db: !context.currentUser
          ? db
          : getAuthDb({
              tenantId: context?.currentUser?.tenantId,
              userId: context?.currentUser?.id,
            }),
      })
    },
  }
}

```

#### 3.1) Implement the plugin

The plugin can be added to your application's GraphQL handler (`api/src/functions/graphql.{js|ts}`) using the `extraPlugins` field.

```TypeScript
import { usePrismaAuth } from 'src/plugins/prisma-auth'

export const handler = createGraphQLHandler({
  extraPlugins: [usePrismaAuth()],
})
```

#### 3.2) Add type declarations (optional)

If your project is written in TypeScript - or if you get errors trying to access `context.db` - you can extend Redwood's `GlobalContext` interface to include proper types for the context's Prisma Client. The following [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/types/redwoodjs.d.ts) and is added to a file in a `types` directory which you should add to the root of your project.

```TypeScript
import type { getAuthDb } from 'api/src/lib/db'

declare module '@redwoodjs/graphql-server' {
  interface GlobalContext {
    db: ReturnType<typeof getAuthDb>
  }
}
```

### 4) Add RLS policies using a database migration

Because Prisma does not support expressing security policies in its schema file, [RLS can be enabled](https://www.postgresql.org/docs/current/sql-altertable.html) and [`CREATE POLICY` commands](https://www.postgresql.org/docs/current/sql-createpolicy.html) can be added to a blank migration file created using the command below.

```bash
yarn rw prisma migrate dev --create-only
```

Once the migration file has been created, RLS can be enabled and policies created on the database's tables. The following is a portion of [this repository's RLS migration](https://github.com/realStandal/redwood-rls-demo/blob/main/api/db/migrations/20230208064740_add_rls_policies/migration.sql) with comments to explain what each command is doing and why it's present.

```SQL
-- 1) Enable row-level security on the "Tenants" table.
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;

-- 2) Ensure security policies apply to the table's owner (by default they do not).
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;

-- 3) Create a policy which ensures the `app.tenantId` transaction parameter is equal to the target row's `id` column.
CREATE POLICY tenant ON "Tenant" USING ("id" = current_setting('app.tenantId', TRUE)::text);

-- 4) Create a policy allowing access to the table if the `app.bypass` parameter is equal to `'on'`.
CREATE POLICY tenant_bypass ON "Tenant" USING (current_setting('app.bypass', TRUE)::text = 'on');
```

Once you've enabled RLS and have defined any security policies, the migration can be applied to your database.

```
yarn rw prisma migrate dev
```

## License

This example is available under [the MIT license](./LICENSE).

## References

* [Documentation on Prisma Client extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)
* [Documentation on Raw database access](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
* [Prisma Client Extension - Row Level Security example](https://github.com/prisma/prisma-client-extensions/tree/main/examples/row-level-security#prisma-client-extension---row-level-security)
* [Postgres Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
* [RedwoodJS Documentation](https://redwoodjs.com/docs/introduction)
