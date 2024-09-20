#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({
  path: envPath,
});

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

let action, dbName, sourceDbName, destDbName;
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
  sourceDbName = process.argv[3];
  destDbName = process.argv[4];
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

// Check if the correct number of arguments are provided
if (process.argv.length !== 4) {
  console.log('Usage: node manage-db.js <create|delete|purge> <database_name>');
  process.exit(1);
}

// Default database name for local development
const DEFAULT_DATABASE_NAME = 'apadana';

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
// Function to create a database
async function createDatabase() {
  const client = new Client({
    host: POSTGRES_HOST,
    user: databaseUserName,
    password: databasePassword,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
  });

  try {
    const secureClient = new Client({
      host: POSTGRES_HOST,
      user: databaseUserName,
      password: databasePassword,
      port: POSTGRES_PORT,
      database: POSTGRES_DATABASE, // Use the default database to check and create
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false, // Set to true in production
            }
          : false,
    });
    console.log('Connecting to database using SSL...');
    await secureClient.connect();
    console.log(`Connected to '${POSTGRES_DATABASE}' using SSL.`);

    // Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await secureClient.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await secureClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(
        `Database '${dbName}' already exists. Skipping creation and cloning.`,
      );
    }

    await secureClient.end();

    const databaseUrl = `postgresql://${databaseUserName}:${databasePassword}@${POSTGRES_HOST}:${POSTGRES_PORT}/${dbName}?sslmode=require`;
    // Write the POSTGRES_URL to the .env file
    const envPath = path.resolve(process.cwd(), '.env');
    fs.writeFileSync(envPath, `POSTGRES_URL=${databaseUrl}`);
    process.env.POSTGRES_URL = databaseUrl;
    console.log(`Updated POSTGRES_URL in ${envPath} file for '${dbName}'.`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`Database '${dbName}' already exists. Skipping creation.`);
    } else {
      console.error('Error creating database:', error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

// Function to delete a database
async function deleteDatabase() {
  const client = new Client({
    host: POSTGRES_HOST,
    user: databaseUserName,
    password: databasePassword,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
  });

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
  if (dbName === DEFAULT_DATABASE_NAME) {
    databaseUserName = execSync('whoami').toString().trim();
    databasePassword = 'admin';
  }
  const client = new Client({
    host: POSTGRES_HOST,
    user: databaseUserName,
    password: databasePassword,
    port: POSTGRES_PORT,
    database: dbName,
  });

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

async function cloneDatabase() {
  const client = new Client({
    host: POSTGRES_HOST,
    user: databaseUserName,
    password: databasePassword,
    port: POSTGRES_PORT,
    database: sourceDbName,
  });

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
      `All data and tables in '${sourceDbName}' have been cloned to '${destDbName}'.`,
    );
  } catch (error) {
    console.error('Error cloning database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle CLI arguments
async function main() {
  switch (action) {
    case ACTIONS.CLONE:
      await cloneDatabase();
      break;
    case ACTIONS.CREATE:
      await createDatabase();
      break;
    case ACTIONS.DELETE:
      await deleteDatabase();
      break;
    case ACTIONS.PURGE:
      await purgeDatabase();
      break;
    default:
      console.error(
        `Invalid action: ${action}. Use 'create', 'delete', 'clone' or 'purge'.`,
      );
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
