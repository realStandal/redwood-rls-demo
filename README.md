<div align="center">
  <h1>🚣‍♀️&nbsp;&nbsp;&nbsp;RedwoodJS Postgres RLS</h1>
  <p>(a) Demonstration of Postgres row-level security in a RedwoodJS application</p>
  <br />
</div>

This repository provides a demonstration of how to use [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). The README has been divided into two sections:

* [Getting Started](#getting-started) with this repository.
* [Supporting RLS](#supporting-rls) in a RedwoodJS application.

## Getting Started

The following provides steps to clone and setup this repository on your development machine.

### 0) Prerequisites

* See and fulfill the [RedwoodJS prerequisites](https://redwoodjs.com/docs/quick-start)
* Postgres database (one of)
  * [Docker](https://www.docker.com/products/docker-desktop/) - Used to run a short-lived Postgres container.
  * [Local installation](https://redwoodjs.com/docs/local-postgres-setup) - A tutorial from Redwood on installing Postgres to your machine.
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

A [compose configuration](./docker-compose.yml) has been provided which will start and expose a Postgres container which can be connected to using the username `postgres` and password `secret`.

```bash
docker compose up -d
```

Once you are done using this database, it can be stopped using the following.

```bash
docker compose down
```

#### 2.2) Update the connection string (non-Docker)

This demonstration has been setup with the assumption you will be running a database using the attached compose configuration. If you are not using it, you will need to create and configure an environment file (or update `.env.defaults`) with the updated connection string.

```dotenv
DATABASE_URL=...
```

### 3) Migrate and seed your database

```bash
yarn rw prisma migrate dev
```

After your database has been migrated, your can seed it using [the provided script](https://github.com/realStandal/redwood-rls-demo/blob/main/scripts/seed.ts).

```bash
yarn rw exec seed
```

It will create numerous `Tenants`, `Users`, and `Posts` by these users. As defined by the [migrated security policies](https://github.com/realStandal/redwood-rls-demo/blob/main/api/db/migrations/20230208064740_add_rls_policies/migration.sql): users will only be able to access posts created by users in the same tenant as them. In addition, posts can only be updated and deleted by the user who created the post. The list below provides a summary of the data which is added by the script.

* Password used by all users: `123`
* Tenant `A`
  * User `A1` with 4 posts
  * User `A2` with 1 post
* Tenant `B`
  * User `B1` with 3 posts
  * User `B2` with 2 posts

### 4) Start the development server and login

Start Redwood's development server, which should eventually open the `/login` page in a new browser window. Use one of the usernames listed in the previous section in combination with the password: `123` to login. After logging in, you should be navigated to the `/posts` page where only post by the selected user's tenant will be visible. Clicking the "Logout" button will allow you to login to another account - switching to a user in another tenant should  cause a new list of posts to appear.

```bash
yarn rw dev
```

## Supporting RLS

This section details supporting [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). These steps have been applied to this repository and are listed here to be generalized across applications.

### 1) Create a user which respects RLS policies

In order to use row-level security, a database needs to be connected to as a non root user which **does not** have the `BYPASSRLS` attribute. To check if the configured user will respect RLS policies, a [script](./scripts/check-rls.ts) has been included which prints the results to the console. This script can be copy-and-pasted into your application for easy reuse.

```bash
yarn rw exec check-rls
```

To simplify creating a user which respects RLS policies, another [script](./scripts/setup-user.ts) has been included which will prompt you for a username, password, and whether or not there is an existing database the user should have access to. This script will use the database configured in `.env.defaults` or `.env` and **should** be ran by a root user.

```bash
yarn rw exec setup-user
```

> **Warning**
>
> When accessing [Prisma Studio](https://www.prisma.io/studio) using a user which respects RLS policies, you may not have a complete view of your application's data.

Your application can then connect to your database using this user to ensure data is accessed according to any security policies you have in place.

### 2) Extend the Prisma Client

In order to [extend a Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions), extensions need to be enabled as a preview feature in your database's schema.

```prisma
generator client {
  previewFeatures = ["clientExtensions"]
}
```

After being enabled, we can extend all operations to include [parameters on the current transaction](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET). We can then make use of this parameter in security policies and as the default value of columns inserted using the extended client. In particular, this is useful for associating operations on the database with the user who made the request. The following [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/api/src/lib/db.ts#L23) and demonstrates associating queries with two distinct values.

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

We can provide the extended client to all services by creating a [Yoga Plugin](https://the-guild.dev/graphql/yoga-server/docs/features/envelop-plugins) which includes a customized client in the context of each request. If the user does not exist, or if the application is being accessed anonymously, the original client will be added instead. Like the other code samples, this one [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/main/api/src/plugins/prisma-auth.ts).

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

Because Prisma does not support expressing security policies using its schema, [RLS can be enabled](https://www.postgresql.org/docs/current/sql-altertable.html) and [`CREATE POLICY` commands](https://www.postgresql.org/docs/current/sql-createpolicy.html) can be added to an existing migration file. A new, blank migration can be created using the command below.

```bash
yarn rw prisma migrate dev --create-only
```

The following is a portion of [this repository's RLS migration](https://github.com/realStandal/redwood-rls-demo/blob/main/api/db/migrations/20230208064740_add_rls_policies/migration.sql) with explanations as to what each command is doing and why it's present.

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

Once you've enabled RLS and have defined all security policies, the migration can be applied to your database.

```
yarn rw prisma migrate dev
```

### 5) Use the extended client in services

```JavaScript
export const posts = () => {
  return context.db.post.findMany()
}
```

## License

This example is available under [the MIT license](./LICENSE).

## References

* [Documentation on Prisma Client extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)
* [Documentation on Raw database access](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
* [Prisma Client Extension - Row Level Security example](https://github.com/prisma/prisma-client-extensions/tree/main/examples/row-level-security#prisma-client-extension---row-level-security)
* [Postgres Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
* [RedwoodJS Documentation](https://redwoodjs.com/docs/introduction)
