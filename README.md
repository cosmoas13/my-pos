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

Copy env example if needed:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` to match your local PostgreSQL database.

Run Prisma generate:

```bash
npm run db:generate
```

Run migration:

```bash
npm run db:migrate
```

Seed initial categories, units, and sample products:

```bash
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts local development server.
- `npm run build` builds the app.
- `npm run lint` runs ESLint.
- `npm run db:generate` generates Prisma Client.
- `npm run db:migrate` runs Prisma migration.
- `npm run db:seed` seeds initial POS data.
- `npm run db:studio` opens Prisma Studio.

## Product Notes

The current first screen is a static POS shell based on `docs/PRD.md`: matcha palette, product grid, cart, Cash/QRIS payment choices, print action, and export action. Backend schema is already modeled in Prisma and ready for local PostgreSQL migration.
