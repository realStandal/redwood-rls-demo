<div align="center">
  <h1>🚣‍♀️&nbsp;&nbsp;&nbsp;Row-Level Multi-Tenancy</h1>
  <p>(a) Demonstration of row-level multi-tenancy in the RedwoodJS framework</p>
  <br />
</div>

This repository provides a demonstration of how to use [PostgreSQL row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) from within the [RedwoodJS framework](https://redwoodjs.com). While this demonstration assumes a new project with a freshly installed/blank database - this demonstration is applicable to any project wishing to benefit from the row-level security of Postgres.

## Getting Started

In brief, the steps to use this demo will be the following:

0) Install any prerequisites.
1) Clone the source code and install dependencies.
2) (optional) Start your database.
3) Create a database user with limited access.
4) Add

### 0) Prerequisites

* [See the RedwoodJS prerequisites](https://redwoodjs.com/docs/quick-start)
* PostgreSQL Database
  * [Docker](https://www.docker.com/products/docker-desktop/) - Use Docker to facilitate running a short-lived Postgres container.
  * [Local installation](https://redwoodjs.com/docs/local-postgres-setup) - A tutorial from the RedwoodJS documentation on installing Postgres directly to your machine.
  * ... - Your preferred method of accessing a development database.

### 1) Get the code

```bash
git clone ...
```

```bash
cd ...
```

```bash
yarn install
```

### 2) (optional) Start your database

If you haven't already, or if you are making use of [this demonstration's compose configuration](./docker-compose.yml), you'll need to start your PostgreSQL database and configure the project.

#### 2.1) Start the database container (Docker)

If you are using Docker to provide a Postgres database, the following will start it using the attached `docker-compose.yml` using [Docker Compose](https://docs.docker.com/compose/).

```bash
docker compose up -d
```

#### 2.2) Update the connection string (non-Docker)

By default, the project is configured with the assumption you will be running a database using Docker. **If you are not using Docker**, you will need to create and configure a file named `.env` with an updated connection string.

```dotenv
DATABASE_URL=...
TEST_DATABASE_URL=...
```

### 3) Create a database user with limited access

In order to make use of Postgres' row-level security, you need to access the database as a non-superuser and as one which **does not** have the `BYPASSRLS` attribute. The initial user created when Postgres is first setup is a superuser, so we'll need to create a new one from which our application can access the database. To facilitate this process, a [script](https://redwoodjs.com/docs/cli-commands#generate-script) has been added which will create this user, prompting you for a username, password, and whether or not there is an existing database this user should have access to. This script will use the database configured in `.env.defaults` or `.env` and **should** be ran as a superuser.

> **Note**
> By default, the project is configured with the assumption you will be running a database using Docker. **If you are not using Docker**, you will need to create and configure a file named `.env` with an updated connection string.

```bash
yarn rw exec setup-db-user
```

## References

* [Prisma Client Extension - Row Level Security](https://github.com/prisma/prisma-client-extensions/tree/main/examples/row-level-security#prisma-client-extension---row-level-security)
