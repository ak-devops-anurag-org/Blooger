const { Pool } = require("pg");

// Validate required environment variables
const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key] || process.env[key].trim() === ""
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}.\n` +
    `Please create/update your .env file with the required database configuration.`
  );
}

const dbPort = Number(process.env.DB_PORT);

if (Number.isNaN(dbPort)) {
  throw new Error(
    `Invalid DB_PORT value "${process.env.DB_PORT}". DB_PORT must be a valid number.`
  );
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: dbPort,
  database: process.env.DB_NAME,
});

async function initDB() {
  let client;

  try {
    client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
        emoji VARCHAR(10) DEFAULT '✨',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        author VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Failed to initialize the database.");
    console.error(`Reason: ${err.message}`);

    if (err.code === "ECONNREFUSED") {
      console.error(
        "PostgreSQL is not running or is not reachable. Verify the host, port, and that the database server is running."
      );
    } else if (err.code === "28P01") {
      console.error(
        "Invalid database username or password."
      );
    } else if (err.code === "3D000") {
      console.error(
        "Database does not exist."
      );
    } else if (err.code === "ENOTFOUND") {
      console.error(
        "Database host could not be resolved."
      );
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = { pool, initDB };


// const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT, 10),
//   database: process.env.DB_NAME,
// });

// async function initDB() {
//   const client = await pool.connect();
//   try {
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS posts (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         content TEXT NOT NULL,
//         author VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
//         emoji VARCHAR(10) DEFAULT '✨',
//         created_at TIMESTAMP DEFAULT NOW(),
//         updated_at TIMESTAMP DEFAULT NOW()
//       );
//     `);

//     await client.query(`
//       CREATE TABLE IF NOT EXISTS comments (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
//         author VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
//         content TEXT NOT NULL,
//         created_at TIMESTAMP DEFAULT NOW()
//       );
//     `);

//     console.log('✅ Database tables initialized');
//   } finally {
//     client.release();
//   }
// }

// module.exports = { pool, initDB };
