# My POS

Aplikasi POS toko sembako berbasis Next.js, Tailwind CSS, shadcn-style components, Prisma, dan PostgreSQL.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui structure
- Prisma 7
- PostgreSQL
- Excel export dependency via `xlsx`

## Development

Install dependencies:

```bash
npm install
```

Copy app env example if needed:

```bash
cp .env.example .env
```

For local Docker PostgreSQL, use this `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_pos?schema=public"
```

## Local Database Setup

This project uses Docker for local PostgreSQL and Adminer. Next.js still runs on your host machine with `npm run dev`.

Local architecture:

```txt
Browser -> Next.js on localhost:3000 -> Prisma -> PostgreSQL Docker on localhost:5432
Browser -> Adminer on localhost:8080 -> PostgreSQL Docker
```

Copy Docker env example if you want to customize database credentials or ports:

```bash
cp .env.docker.example .env.docker
```

Start PostgreSQL and Adminer with default local settings:

```bash
docker compose up -d
```

If you do not create `.env.docker`, the compose file uses safe local defaults:

```txt
POSTGRES_DB=my_pos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
ADMINER_PORT=8080
```

Run Prisma generate:

```bash
npm run db:generate
```

Run database migration:

```bash
npm run db:migrate
```

Seed initial categories, units, owner, and sample products:

```bash
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

Open Adminer:

```txt
http://localhost:8080
```

Adminer login:

```txt
System: PostgreSQL
Server: postgres
Username: postgres
Password: postgres
Database: my_pos
```

Daily local development flow:

```bash
docker compose up -d
npm run dev
```

Stop Docker services:

```bash
docker compose down
```

Reset local database data:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

If you created `.env.docker` and want Docker Compose to read it explicitly, add `--env-file .env.docker` after `docker compose`.

## Prisma

Prisma is used as the ORM for PostgreSQL. The schema lives in `prisma/schema.prisma`, and the generated client is used by the Next.js server components and server actions.

### Prisma Commands

Generate Prisma Client:

```bash
npm run db:generate
```

Use this after installing dependencies, after changing `prisma/schema.prisma`, or after pulling schema changes from GitHub.

Create/apply database migrations:

```bash
npm run db:migrate
```

Use this when the database is empty or when `prisma/schema.prisma` changes. In local development, this creates migration files and applies them to PostgreSQL.

Seed initial categories, units, owner, and sample products:

```bash
npm run db:seed
```

Use this after migration when you need starter data for local development.

Open Prisma Studio:

```bash
npm run db:studio
```

Use this to inspect and edit database data from the browser. Prisma Studio is useful for checking tables such as `products`, `sales`, `sale_items`, and `stock_movements`.

Typical first-time database setup:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
```

Typical workflow after changing Prisma schema:

```bash
npm run db:migrate
npm run db:generate
```

Typical workflow for checking stored transaction data:

```bash
npm run db:studio
```

## Scripts

| Command | Function | When to use |
| --- | --- | --- |
| `npm run dev` | Starts the Next.js development server. | Use while developing the app locally. |
| `npm run build` | Builds the app for production. | Use before deployment or before pushing larger changes. |
| `npm run start` | Starts the production build. | Use after `npm run build` to test production mode locally. |
| `npm run lint` | Runs ESLint. | Use before commit/push to catch code issues. |
| `npm run db:generate` | Generates Prisma Client into `src/generated/prisma`. | Use after install, schema changes, or pulling schema updates. |
| `npm run db:migrate` | Creates/applies Prisma migrations to PostgreSQL. | Use when setting up the DB or changing schema. |
| `npm run db:seed` | Inserts initial local data. | Use after migration or after resetting local DB. |
| `npm run db:studio` | Opens Prisma Studio in the browser. | Use to inspect/edit database tables visually. |

Before pushing to GitHub, a good quick check is:

```bash
npm run lint
npm run build
```

## Product Notes

The current POS screen is connected to PostgreSQL through Prisma server components and server actions. It supports product/category loading, cart actions, Cash/QRIS checkout, stock decrement, sales records, sale items, and stock movement records.
