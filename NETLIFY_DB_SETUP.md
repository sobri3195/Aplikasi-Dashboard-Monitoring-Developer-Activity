# Netlify DB Setup

This document describes the Netlify DB initialization setup for this project.

## Overview

Netlify DB has been initialized with Drizzle ORM for database management. The setup includes:

- **ORM:** Drizzle ORM
- **Database:** Neon PostgreSQL (reusing existing connection)
- **Schema Management:** TypeScript with type-safe queries

## Files Created

### 1. `drizzle.config.ts`
Configuration file for Drizzle Kit, which manages migrations and schema changes.

### 2. `db/schema.ts`
Database schema definitions using Drizzle ORM syntax. This is where you define your tables and relationships.

### 3. `db/index.ts`
Database client initialization that exports a configured Drizzle instance connected to your Neon database.

### 4. `package.json` (root)
Added Drizzle ORM dependencies and database management scripts.

## Database Connection

The setup uses the existing `DATABASE_URL` environment variable that points to your Neon PostgreSQL database:

```
postgresql://neondb_owner:npg_vOLcZhqtd0H6@ep-noisy-lake-ae59gmr9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Available Scripts

Run these commands from the project root:

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to the database
npm run db:migrate

# Push schema changes directly (for development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Usage

### Defining Tables

Edit `db/schema.ts` to add or modify tables:

```typescript
import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Querying the Database

Import the database client in your code:

```typescript
import { db } from './db';
import { users } from './db/schema';

// Select all users
const allUsers = await db.select().from(users);

// Insert a user
await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
});

// Update a user
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.email, 'user@example.com'));
```

## Integration with Existing Prisma Setup

This project also uses Prisma for database management (see `backend/prisma`). You can use both:

- **Prisma:** For the existing backend Express.js API
- **Drizzle:** For serverless functions and new features

Both ORMs connect to the same Neon database using the same `DATABASE_URL`.

## Netlify Functions Integration

To use Drizzle in Netlify Functions:

```typescript
// netlify/functions/example.ts
import { db } from '../../db';
import { users } from '../../db/schema';

export async function handler(event, context) {
  const allUsers = await db.select().from(users);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ users: allUsers }),
  };
}
```

## Environment Variables

Ensure these variables are set in Netlify:

- `DATABASE_URL`: PostgreSQL connection string (already configured)

## Migration Workflow

1. **Modify schema** in `db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review migration** in `drizzle/` directory
4. **Apply migration**: `npm run db:migrate`

For development, you can use `npm run db:push` to skip migration files and push changes directly.

## Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Neon Database](https://neon.tech/docs)

## Notes

- The Drizzle setup complements the existing Prisma setup
- Both ORMs can coexist and use the same database
- Use Drizzle for serverless functions and edge computing
- Use Prisma for the traditional Express.js backend

## Troubleshooting

### Connection Issues

Make sure `DATABASE_URL` is set correctly:

```bash
echo $DATABASE_URL
```

### TypeScript Errors

Install TypeScript dependencies:

```bash
npm install --save-dev typescript @types/node
```

### Migration Issues

If migrations fail, you can reset:

```bash
npm run db:push
```

---

**Status:** ✅ Netlify DB Initialized  
**ORM:** Drizzle  
**Database:** Neon PostgreSQL  
**Last Updated:** 2024
