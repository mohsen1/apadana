#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config();

// Check if the correct number of arguments are provided
if (process.argv.length !== 4) {
  console.log('Usage: node manage-db.js <create|delete> <database_name>');
  process.exit(1);
}

const ACTION = process.argv[2];
const DB_NAME = process.argv[3];

// Load environment variables
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || 'verceldb';

// Validate environment variables
if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD) {
  console.error(
    'Error: POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD must be set as environment variables.',
  );
  process.exit(1);
}
// Function to create a database
async function createDatabase() {
  const client = new Client({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
  });

  try {
    const secureClient = new Client({
      host: POSTGRES_HOST,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
      database: POSTGRES_DATABASE, // Use the default database to check and create
      ssl: {
        rejectUnauthorized: false, // Set to true in production
      },
    });
    console.log('Connecting to database using SSL...');
    await secureClient.connect();
    console.log(`Connected to '${POSTGRES_DATABASE}' using SSL.`);

    // Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await secureClient.query(checkDbQuery, [DB_NAME]);

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await secureClient.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database '${DB_NAME}' created successfully.`);

      // Clone data from POSTGRES_DATABASE to DB_NAME
      console.log(
        `Cloning data from '${POSTGRES_DATABASE}' to '${DB_NAME}'...`,
      );
      try {
        const dumpCommand = `PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -p ${POSTGRES_PORT} ${POSTGRES_DATABASE}`;
        const restoreCommand = `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -p ${POSTGRES_PORT} -d ${DB_NAME}`;
        const fullCommand = `${dumpCommand} | ${restoreCommand}`;

        console.time('Cloning data');
        await execPromise(fullCommand);
        console.timeEnd('Cloning data');
        console.log(
          `Data cloned successfully from '${POSTGRES_DATABASE}' to '${DB_NAME}'.`,
        );
      } catch (cloneError) {
        console.error(`Error cloning data: ${cloneError.message}`);
      }
    } else {
      console.log(
        `Database '${DB_NAME}' already exists. Skipping creation and cloning.`,
      );
    }

    await secureClient.end();

    const databaseUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${DB_NAME}?sslmode=require`;
    // Write the POSTGRES_URL to the .env file
    const envPath = path.resolve(process.cwd(), '.env');
    fs.writeFileSync(envPath, `POSTGRES_URL=${databaseUrl}`);
    process.env.POSTGRES_URL = databaseUrl;
    console.log(`Updated POSTGRES_URL in ${envPath} file for '${DB_NAME}'.`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`Database '${DB_NAME}' already exists. Skipping creation.`);
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
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
  });

  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
    console.log(`Database '${DB_NAME}' deleted successfully.`);
  } catch (error) {
    console.error('Error deleting database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle CLI arguments
async function main() {
  switch (ACTION.toLowerCase()) {
    case 'create':
      await createDatabase();
      break;
    case 'delete':
      await deleteDatabase();
      break;
    default:
      console.error(`Invalid action: ${ACTION}. Use 'create' or 'delete'.`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
