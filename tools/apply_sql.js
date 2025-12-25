const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const sql = fs.readFileSync('drizzle/0022_add_services_brands_trust_features.sql', 'utf8');
    const dbUrl = process.env.DATABASE_URL || process.env.P_DB_URL;
    if (!dbUrl) throw new Error('DATABASE_URL or P_DB_URL is not set in env');

    // Create connection using DATABASE_URL
    const conn = await mysql.createConnection({ uri: dbUrl, multipleStatements: true });
    console.log('Connected to DB, executing migration...');
    const [res] = await conn.query(sql);
    console.log('Migration executed:', res);
    await conn.end();
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();