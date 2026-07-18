import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

export const createPool = () => {
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    max: 10,
    idleTimeoutMillis: 10000, // Close idle connections after 10 seconds to prevent silent firewalls termination
    maxUses: 15, // Recreate connection after 15 uses to keep connections fresh
    keepAlive: true, // Enable TCP Keep-Alive
    keepAliveInitialDelayMillis: 10000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });

/**
 * Recursively checks if the error or its nested causes are connection/network errors.
 */
function isDbConnectionError(err: any): boolean {
  if (!err) return false;

  const messages: string[] = [];
  const codes: string[] = [];

  let current = err;
  let depth = 0;
  // Limit depth to 5 to prevent infinite loops if there's circular references
  while (current && depth < 5) {
    if (current.message) messages.push(String(current.message).toLowerCase());
    if (current.code) codes.push(String(current.code).toLowerCase());
    
    // Check if there is a nested error
    current = current.cause || current.originalError || current.driverError;
    depth++;
  }

  const isConnMessage = messages.some(msg => 
    msg.includes('terminated unexpectedly') ||
    msg.includes('connection terminated') ||
    msg.includes('closed') ||
    msg.includes('econnreset') ||
    msg.includes('socket') ||
    msg.includes('pool submit') ||
    msg.includes('client has encountered a connection error') ||
    msg.includes('connection error') ||
    msg.includes('handshake') ||
    msg.includes('timeout')
  );

  const isConnCode = codes.some(code => 
    code === 'econnreset' || 
    code === '57p01' || // admin shutdown
    code === '08003' || // connection_does_not_exist
    code === '08006' || // connection_failure
    code === '08001' || // sqlclient_unable_to_establish_sqlconnection
    code === '08004' || // sqlserver_rejected_establishment_of_sqlconnection
    code === '08007' || // transaction_resolution_unknown
    code === '08p01'    // protocol_violation
  );

  return isConnMessage || isConnCode;
}

/**
 * Executes a database operation with a retry mechanism if a connection error is encountered.
 */
export async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      
      if (isDbConnectionError(err) && i < retries) {
        console.warn(`[Database Retry] Connection error encountered. Retrying (${i + 1}/${retries}) in ${delay}ms...`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

