# Netlify DB Quick Start Guide

## What Was Set Up

The `netlify db init` process has been completed, setting up Drizzle ORM for database management in your Netlify project.

### Created Files

```
project-root/
├── package.json              # Root dependencies for Drizzle
├── tsconfig.json            # TypeScript configuration
├── drizzle.config.ts        # Drizzle Kit configuration
├── db/
│   ├── schema.ts            # Database schema definitions
│   └── index.ts             # Database client
├── netlify/
│   └── functions/
│       ├── package.json     # Updated with Drizzle deps
│       └── db-example.ts    # Example Drizzle function
└── NETLIFY_DB_SETUP.md      # Detailed documentation
```

## Quick Commands

```bash
# Install dependencies
npm install

# Generate migrations from schema
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open database GUI
npm run db:studio
```

## Usage Examples

### 1. Define Tables in `db/schema.ts`

```typescript
import { pgTable, text, serial, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 2. Use in Netlify Functions

```typescript
// netlify/functions/my-function.ts
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const handler: Handler = async (event) => {
  // Select all users
  const allUsers = await db.select().from(users);

  // Select with conditions
  const activeUsers = await db
    .select()
    .from(users)
    .where(eq(users.isActive, true));

  // Insert
  await db.insert(users).values({
    email: 'new@example.com',
    name: 'New User',
  });

  // Update
  await db
    .update(users)
    .set({ name: 'Updated Name' })
    .where(eq(users.email, 'new@example.com'));

  // Delete
  await db
    .delete(users)
    .where(eq(users.email, 'new@example.com'));

  return {
    statusCode: 200,
    body: JSON.stringify({ users: allUsers }),
  };
};
```

### 3. Test the Example Function

After deployment, visit:
```
https://your-site.netlify.app/.netlify/functions/db-example
```

## Development Workflow

### Step 1: Modify Schema
Edit `db/schema.ts` to add/modify tables:

```typescript
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  inStock: boolean('in_stock').default(true),
});
```

### Step 2: Generate Migration
```bash
npm run db:generate
```

This creates a migration file in `drizzle/` directory.

### Step 3: Review Migration
Check the generated SQL in `drizzle/` to ensure it's correct.

### Step 4: Apply Migration
```bash
npm run db:migrate
```

## Environment Setup

### Local Development

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Netlify Deployment

Set environment variables in Netlify Dashboard:
- Go to Site Settings → Environment Variables
- Add `DATABASE_URL` with your Neon connection string

The project is already configured with Neon:
```
postgresql://neondb_owner:npg_vOLcZhqtd0H6@ep-noisy-lake-ae59gmr9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Drizzle vs Prisma

This project now supports both ORMs:

| Feature | Prisma | Drizzle |
|---------|--------|---------|
| Location | `backend/` | `db/` (root) |
| Use Case | Express.js API | Serverless Functions |
| Type Safety | ✅ | ✅ |
| Edge Runtime | ❌ | ✅ |
| Performance | Good | Excellent |

**When to use which:**
- **Prisma**: Existing backend routes, complex queries, migrations
- **Drizzle**: New Netlify functions, edge functions, simple queries

## Common Operations

### Query All Records
```typescript
const records = await db.select().from(tableName);
```

### Query with Filter
```typescript
import { eq, and, or, like } from 'drizzle-orm';

const filtered = await db
  .select()
  .from(users)
  .where(and(
    eq(users.isActive, true),
    like(users.email, '%@example.com')
  ));
```

### Join Tables
```typescript
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.authorId, users.id));
```

### Insert Multiple
```typescript
await db.insert(users).values([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' },
]);
```

## Troubleshooting

### "Cannot find module 'drizzle-orm'"

Install dependencies:
```bash
cd netlify/functions && npm install
cd ../.. && npm install
```

### "DATABASE_URL is not defined"

Set the environment variable:
```bash
export DATABASE_URL='your-connection-string'
```

### TypeScript Errors

Ensure TypeScript is installed:
```bash
npm install --save-dev typescript @types/node
```

### Migration Conflicts

Reset and push schema directly (dev only):
```bash
npm run db:push
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Neon Database](https://neon.tech/docs)
- [TypeScript](https://www.typescriptlang.org/)

## Next Steps

1. ✅ Netlify DB initialized with Drizzle
2. Customize `db/schema.ts` with your tables
3. Generate and apply migrations
4. Create Netlify functions using Drizzle
5. Deploy to Netlify
6. Test your functions

---

**Status:** ✅ Ready to use  
**Database:** Neon PostgreSQL  
**ORM:** Drizzle  
**Framework:** Netlify Functions
