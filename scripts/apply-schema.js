import pg from 'pg';
import fs from 'fs';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const { Client } = pg;

// Pooler connection string for IPv4
const poolerUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function main() {
  console.log('Connecting to Supabase (ap-southeast-1)...');
  const client = new Client({
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const res = await client.query('SELECT version();');
    console.log('Database version:', res.rows[0].version);

    const extRes = await client.query('SELECT extname FROM pg_extension;');
    console.log('Installed extensions:', extRes.rows.map(r => r.extname).join(', '));

    const schemaPath = process.env.SCHEMA_PATH || new URL('./schema.sql', import.meta.url).pathname;
    if (fs.existsSync(schemaPath)) {
      console.log('Reading 0001_schema.sql...');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Executing schema...');
      await client.query(sql);
      console.log('Schema applied successfully!');
    } else {
      console.log('Schema file not found at:', schemaPath);
    }

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Public tables in Supabase:', tablesRes.rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    if (client) await client.end();
  }
}

main();
