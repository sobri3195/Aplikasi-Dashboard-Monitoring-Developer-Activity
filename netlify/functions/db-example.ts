import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { users } from '../../db/schema';

export const handler: Handler = async (event, context) => {
  try {
    // Example: Fetch all users using Drizzle ORM
    const allUsers = await db.select().from(users);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Drizzle ORM query successful',
        users: allUsers,
        count: allUsers.length,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Database error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Database query failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
