<div align="center">
  <h1>🚣‍♀️&nbsp;&nbsp;&nbsp;RedwoodJS Postgres RLS</h1>
  <p>(a) Demonstration of Postgres row-level security in a RedwoodJS application</p>
  <br />
</div>

This repository provides a demonstration of how to use [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). While this demonstration assumes a new project with a blank database, its patterns can be used in any project which needs RLS.

* [Getting Started](#getting-started) with this repository.
* [Supporting RLS](#supporting-rls) in a RedwoodJS application.

## Getting Started

The following provides a set of steps for cloning and setting up this repository on your development machine. The next section, [Supporting RLS](#supporting-rls), details supporting row-level security from within a RedwoodJS application.

### 0) Prerequisites

* See the [RedwoodJS prerequisites](https://redwoodjs.com/docs/quick-start)
* Postgres Database (one of)
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

### 2) Start your database

If you haven't already, or if you're making use of this demonstration's [compose configuration](./docker-compose.yml), you'll need to start your Postgres database.

#### 2.1) Start the database container (Docker)

If you're using Docker to provide a Postgres database, the following will start it using [Docker Compose](https://docs.docker.com/compose/).

```bash
docker compose up -d
```

#### 2.2) Update the connection string (non-Docker)

By default, the project is configured with the assumption you will be running a database using Docker. If you are **not using Docker**, you will need to create and configure a file named `.env` with an updated connection string.

```dotenv
DATABASE_URL=...
```

### 3) Migrate and seed your database

Once your database has been started and the application configured, apply all pending database migrations.

```bash
yarn rw prisma migrate dev
```

After your database has been migrated, your can seed it using [the provided script](https://github.com/realStandal/redwood-rls-demo/blob/main/scripts/seed.ts).

```bash
yarn rw exec seed
```

## Supporting RLS

This section details supporting [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within [a RedwoodJS application](https://redwoodjs.com). These steps have been applied to this repository and have been listed here to generalize them across applications.

### 1) Create a user which respects RLS policies

In order to use row-level security, a database needs to be connected to as a non-superuser which **does not** have the `BYPASSRLS` attribute. To check if the configured user will respect RLS policies, a [script](./scripts/check-rls.ts) has been added:

```bash
yarn rw exec check-rls
```

To simplify creating a user which respects RLS policies, a [script](./scripts/setup-user.ts) has been added. It will prompt you for a username, password, and whether or not there is an existing database this user should have access to. This script will use the database configured in `.env.defaults` or `.env` and **should** be ran by a superuser.

```bash
yarn rw exec setup-user
```

> **Warning**
>
> When accessing [Prisma Studio](https://www.prisma.io/studio) using a user which respects RLS policies, you may not have a complete view of your application's data.

### 2) Extend the Prisma Client

In order to [extend the Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions), extensions need to be enabled as a preview feature.

```prisma
generator client {
  previewFeatures = ["clientExtensions"]
}
```

After being enabled, an extension can be added to all queries, across all models, and for all operations on these models. This extension should [set a parameter on the current transaction](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET) which we can use to authorize security policies and as the default value of columns. This is really useful for associating a set of requests with a particular user of the application. The following [has been taken from this repository](https://github.com/realStandal/redwood-rls-demo/blob/7f4da2c7a4d2eb3dd53574b78e0125a3ca0e8c1a/api/src/lib/db.ts#L25) and demonstrates associating queries with two distinct values.

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

(bypass extension)

### 3) Create a Yoga Plugin for the extended client

We can provide the extended client to each service in our application by creating a [Yoga Plugin](https://the-guild.dev/graphql/yoga-server/docs/features/envelop-plugins) which extends RedwoodJS' context. If the user does not exist, or if the application is being accessed anonymously, the original client will be added instead.

```TypeScript
import type { Plugin } from 'graphql-yoga'

import type { GlobalContext } from '@redwoodjs/graphql-server'

import { db, getAuthDb } from 'src/lib/db'

export const usePrismaAuth = (): Plugin<GlobalContext> => {
  return {
    onContextBuilding: ({ context, extendContext }) => {
      extendContext({
        prisma: !context.currentUser
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

#### 3.1) Add the plugin to the application's GraphQL handler

The plugin can be added to your application's GraphQL handler (`api/src/functions/graphql.{js|ts}`) using the `extraPlugins` field.

```TypeScript
import { usePrismaAuth } from 'src/plugins/prisma-auth'

export const handler = createGraphQLHandler({
  extraPlugins: [usePrismaAuth()],
})
```

### 4) Add RLS policies using a database migration



## License

This example is available under [the MIT license](./LICENSE).

## References

* [Documentation on Prisma Client extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)
* [Documentation on Raw database access](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
* [Prisma Client Extension - Row Level Security example](https://github.com/prisma/prisma-client-extensions/tree/main/examples/row-level-security#prisma-client-extension---row-level-security)
* [Postgres Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
* [RedwoodJS Documentation](https://redwoodjs.com/docs/introduction)
