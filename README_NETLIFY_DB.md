# Netlify DB Integration - Complete Guide

## 🎯 Overview

This project now includes **Netlify DB** integration using **Drizzle ORM**, providing a modern, type-safe way to interact with the Neon PostgreSQL database from Netlify serverless functions.

## 📦 What's Included

### Core Files

```
project-root/
├── db/                          # Database layer
│   ├── schema.ts               # Table definitions
│   └── index.ts                # Database client
├── drizzle.config.ts           # Drizzle Kit configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── netlify/
    └── functions/
        ├── db-example.ts       # Example function
        └── package.json        # Updated with Drizzle
```

### Documentation Files

- **`NETLIFY_DB_INIT_SUMMARY.md`** - Summary of initialization
- **`NETLIFY_DB_SETUP.md`** - Comprehensive setup guide
- **`NETLIFY_DB_QUICK_START.md`** - Quick start with examples
- **`README_NETLIFY_DB.md`** - This file

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Ensure `DATABASE_URL` is set:

```bash
export DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'
```

Or use the existing Neon connection (already configured):
```
postgresql://neondb_owner:npg_vOLcZhqtd0H6@ep-noisy-lake-ae59gmr9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Define Your Schema

Edit `db/schema.ts`:

```typescript
import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 4. Generate & Run Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Or push directly (dev mode)
npm run db:push
```

### 5. Use in Netlify Functions

```typescript
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { users } from '../../db/schema';

export const handler: Handler = async () => {
  const allUsers = await db.select().from(users);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ users: allUsers }),
  };
};
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema |
| `npm run db:migrate` | Apply migrations to database |
| `npm run db:push` | Push schema directly (skip migrations) |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

## 📚 Documentation

For detailed information, see:

1. **[Quick Start Guide](./NETLIFY_DB_QUICK_START.md)** - Get started quickly with examples
2. **[Setup Documentation](./NETLIFY_DB_SETUP.md)** - Comprehensive setup and usage guide
3. **[Init Summary](./NETLIFY_DB_INIT_SUMMARY.md)** - What was done during initialization

## 🔗 Integration Architecture

### Dual ORM Setup

This project supports **two ORMs** for different use cases:

| Component | ORM | Location | Use Case |
|-----------|-----|----------|----------|
| **Backend API** | Prisma | `backend/` | Traditional Express.js server |
| **Serverless** | Drizzle | `db/` (root) | Netlify Functions, Edge |

Both connect to the **same Neon PostgreSQL database**.

### Why Two ORMs?

- **Prisma**: Excellent for traditional backend with complex queries and migrations
- **Drizzle**: Lightweight, edge-ready, perfect for serverless/edge functions

Choose the right tool for each job!

## 🌐 Deployment

### Netlify Environment Variables

Set in Netlify Dashboard → Site Settings → Environment Variables:

```env
DATABASE_URL=postgresql://[user]:[pass]@[host]/[db]?sslmode=require
NODE_ENV=production
```

### Deploy

```bash
# Push to git (triggers Netlify build)
git push origin main

# Or deploy manually
netlify deploy --prod
```

### Test

After deployment, test the example function:
```
https://your-site.netlify.app/.netlify/functions/db-example
```

## 📖 Example Queries

### Select All

```typescript
const users = await db.select().from(users);
```

### Filter

```typescript
import { eq } from 'drizzle-orm';

const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'test@example.com'));
```

### Insert

```typescript
await db.insert(users).values({
  email: 'new@example.com',
  name: 'New User',
});
```

### Update

```typescript
await db
  .update(users)
  .set({ name: 'Updated Name' })
  .where(eq(users.id, 1));
```

### Delete

```typescript
await db
  .delete(users)
  .where(eq(users.id, 1));
```

### Join

```typescript
const results = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.authorId, users.id));
```

## 🔧 Development Tips

### 1. Use TypeScript

Drizzle provides full type safety. Let TypeScript guide you:

```typescript
// Types are inferred automatically
const users = await db.select().from(users);
// users is typed as Array<{ id: number, email: string, ... }>
```

### 2. Use Drizzle Studio

Visual database browser:

```bash
npm run db:studio
```

Opens at `https://local.drizzle.studio`

### 3. Migration Strategy

**Development:**
```bash
npm run db:push  # Fast iteration
```

**Production:**
```bash
npm run db:generate  # Generate SQL
npm run db:migrate   # Apply safely
```

## 🐛 Troubleshooting

### "Cannot find module 'drizzle-orm'"

```bash
npm install
cd netlify/functions && npm install
```

### "DATABASE_URL is not defined"

```bash
export DATABASE_URL='your-connection-string'
```

### TypeScript Errors

```bash
npm install --save-dev typescript @types/node
npx tsc --noEmit  # Check for errors
```

### Migration Issues

```bash
# Reset and push (development only)
npm run db:push
```

## 📊 Database Info

- **Provider**: Neon PostgreSQL
- **Version**: 17.5
- **Database**: neondb
- **Connection**: Via DATABASE_URL environment variable
- **SSL**: Required

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables for sensitive data
- Enable SSL for database connections
- Validate input in your functions

## 🎓 Learning Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Neon Database](https://neon.tech/docs)
- [TypeScript](https://www.typescriptlang.org/)

## ✅ Verification Checklist

- [x] Drizzle ORM installed and configured
- [x] Database schema created
- [x] TypeScript setup complete
- [x] Example function created
- [x] Documentation complete
- [x] Dependencies installed
- [x] `.gitignore` updated
- [x] Ready for deployment

## 🆘 Support

For issues or questions:

1. Check the [Quick Start Guide](./NETLIFY_DB_QUICK_START.md)
2. Review [Setup Documentation](./NETLIFY_DB_SETUP.md)
3. Check Netlify function logs
4. Verify environment variables

## 📝 Notes

- This setup complements (not replaces) the existing Prisma setup
- Both ORMs can be used simultaneously
- Choose the right ORM for each use case
- Migrations can be managed independently

---

**Status**: ✅ Ready to use  
**Database**: Neon PostgreSQL  
**ORMs**: Drizzle + Prisma  
**Platform**: Netlify

**Happy coding! 🚀**
