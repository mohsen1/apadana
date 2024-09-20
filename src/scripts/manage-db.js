#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const { Client } = require('pg');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envPath });

// Define available actions
const ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  PURGE: 'purge',
  CLONE: 'clone',
};

// Check if the correct number of arguments are provided
if (process.argv.length < 4 || process.argv.length > 5) {
  console.log('Usage: node manage-db.js <create|delete|purge> <database_name>');
  console.log(
    '       node manage-db.js clone <source_database> <destination_database>',
  );
  process.exit(1);
}

let action, dbName;
let databaseUserName = process.env.POSTGRES_USER;
let databasePassword = process.env.POSTGRES_PASSWORD;

if (process.argv[2] === ACTIONS.CLONE) {
  if (process.argv.length !== 5) {
    console.log(
      'Usage for clone: node manage-db.js clone <source_database> <destination_database>',
    );
    process.exit(1);
  }
  action = ACTIONS.CLONE;
} else {
  if (process.argv.length !== 4) {
    console.log(
      'Usage: node manage-db.js <create|delete|purge> <database_name>',
    );
    process.exit(1);
  }
  action = process.argv[2];
  dbName = process.argv[3];
}

// Default database name for local development
const DEFAULT_DATABASE_NAME =
  process.env.VERCEL_ENV === 'preview' ? 'verceldb' : 'apadana';

// Load environment variables
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || 'verceldb';

// Validate environment variables
if (!POSTGRES_HOST || !databaseUserName || !databasePassword) {
  console.error(
    'Error: POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD must be set as environment variables.',
  );
  process.exit(1);
}

// Function to create a new PostgreSQL client with appropriate SSL settings
function createClient(
  dbName,
  user = databaseUserName,
  password = databasePassword,
) {
  const isProduction = process.env.NODE_ENV === 'production';
  const ssl = isProduction
    ? { rejectUnauthorized: false } // Adjust as needed for your production environment
    : false;

  return new Client({
    host: POSTGRES_HOST,
    user,
    password,
    port: POSTGRES_PORT,
    database: dbName,
    ssl,
  });
}

// Function to delete a database
async function deleteDatabase() {
  const client = createClient(POSTGRES_DATABASE);

  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Database '${dbName}' deleted successfully.`);
  } catch (error) {
    console.error('Error deleting database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Function to purge all data and tables from a database
async function purgeDatabase() {
  let user = databaseUserName;
  let password = databasePassword;

  if (dbName === DEFAULT_DATABASE_NAME) {
    user = execSync('whoami').toString().trim();
    password = 'admin';
  }

  // For Vercel preview, connect to "verceldb" with environment variables
  if (process.env.VERCEL_ENV === 'preview') {
    dbName = 'verceldb';
    user = process.env.POSTGRES_USER;
    password = process.env.POSTGRES_PASSWORD;
    console.log('Connecting to Vercel preview database: verceldb');
  }

  const client = createClient(dbName, user, password);

  try {
    await client.connect();

    // Disable foreign key checks
    await client.query('SET session_replication_role = replica;');

    // Get all table names in the public schema
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

    // Truncate all tables
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      await client.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      console.log(`Truncated table: ${tableName}`);
    }

    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');

    console.log(
      `All data and tables in '${dbName}' have been purged successfully.`,
    );
  } catch (error) {
    console.error('Error purging database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function createAndCloneDatabase(destDbName) {
  const client = createClient(POSTGRES_DATABASE);

  try {
    await client.connect();
    const createAndCloneQuery = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${destDbName}') THEN
          CREATE DATABASE "${destDbName}";
          PERFORM pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${destDbName}';
          EXECUTE 'CREATE DATABASE "${destDbName}" WITH TEMPLATE "${DEFAULT_DATABASE_NAME}"';
        END IF;
      END $$;
    `;

    await client.query(createAndCloneQuery);
    console.log(
      `Database '${destDbName}' created (if not exists) and cloned from '${DEFAULT_DATABASE_NAME}' successfully.`,
    );
  } catch (error) {
    console.error('Error creating and cloning database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle CLI arguments
async function main() {
  switch (action) {
    case ACTIONS.CREATE:
      await createAndCloneDatabase(dbName);
      break;
    case ACTIONS.DELETE:
      await deleteDatabase();
      break;
    case ACTIONS.PURGE:
      await purgeDatabase();
      break;
    default:
      console.error(
        `Invalid action: ${action}. Use 'create', 'delete', 'clone', or 'purge'.`,
      );
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
