<div align="center">
  <h1>🚣‍♀️&nbsp;&nbsp;&nbsp;RedwoodJS Postgres RLS</h1>
  <p>(a) Demonstration of Postgres row-level security in a RedwoodJS application</p>
  <br />
</div>

This repository provides a demonstration of how to use [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within a [RedwoodJS application](https://redwoodjs.com). While this demonstration assumes a new project with a freshly installed/blank database, its patterns can be used in any project which needs RLS.

## Getting Started

0) Install prerequisites.
1) Clone the source code and install dependencies.
2) Start your database. (optional)
3) Create a database user with limited access.

### 0) Prerequisites

* See the [RedwoodJS prerequisites](https://redwoodjs.com/docs/quick-start)
* Postgres Database
  * [Docker](https://www.docker.com/products/docker-desktop/) - Used to run a short-lived Postgres container.
  * [Local installation](https://redwoodjs.com/docs/local-postgres-setup) - A tutorial from the RedwoodJS documentation to install Postgres on your machine.
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

### 2) Start your database (optional)

If you haven't already, or if you're making use of this demonstration's [compose configuration](./docker-compose.yml), you'll need to start your Postgres database and configure the project to make use of its root user.

#### 2.1) Start the database container (Docker)

If you're using Docker to provide a Postgres database, the following will start it using [Docker Compose](https://docs.docker.com/compose/).

```bash
docker compose up -d
```

#### 2.2) Update the connection string (non-Docker)

By default, the project is configured with the assumption you will be running a database using Docker. If you are **not using Docker**, you will need to create and configure a file named `.env` with an updated connection string.

```dotenv
DATABASE_URL=...
TEST_DATABASE_URL=...
```

### 3) Create a database user with limited access

In order to use row-level security, a database needs to be connected to as a non-superuser which **does not** have the `BYPASSRLS` attribute. To check if the configured user will respect RLS policies, a [script](./scripts/check-rls.ts) has been added:

```bash
yarn rw exec check-rls
```

To simplify creating a user which respects RLS policies, a [script](./scripts/setup-user.ts) has been added. It will prompt you for a username, password, and whether or not there is an existing database this user should have access to. This script will use the database configured in `.env.defaults` or `.env` and **should** be ran by a superuser.

```bash
yarn rw exec setup-user
```

## License

This example is licensed under the [MIT](./LICENSE) license.

## References

* [Documentation on Prisma client extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)
* [Prisma Client Extension - Row Level Security example](https://github.com/prisma/prisma-client-extensions/tree/main/examples/row-level-security#prisma-client-extension---row-level-security)
