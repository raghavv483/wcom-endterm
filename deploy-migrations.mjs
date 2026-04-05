#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';

const SUPABASE_URL = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HICV7FpaLTH-O8eBMpWCZQ_sazw-Ftj';

function executeSQL(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vhtlioeeqkkcsycgadcj.supabase.co',
      path: '/rest/v1/rpc/exec_sql_query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('🚀 WaveLearn Database Migrations');
  console.log('═'.repeat(60));
  console.log(`📁 Found ${migrationFiles.length} migration(s):\n`);

  migrationFiles.forEach((file, idx) => {
    console.log(`  ${idx + 1}. ${file}`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log('ℹ️  Note: Direct SQL execution via REST API may require service role key.');
  console.log('Please use Supabase Dashboard SQL Editor for manual deployment.\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n📝 Migration: ${file}`);
    console.log('─'.repeat(60));

    try {
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      console.log(`Found ${statements.length} SQL statements`);
      console.log(`First statement: ${statements[0].substring(0, 60)}...`);

      // Show what would be executed
      console.log(`\n✅ Ready to deploy (manual with Supabase Dashboard)`);
    } catch (err) {
      console.error(`❌ Error parsing: ${err.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📋 DEPLOYMENT INSTRUCTIONS:');
  console.log('─'.repeat(60));
  console.log(`
1. Go to: ${SUPABASE_URL}/dashboard

2. Navigate to: SQL Editor

3. For each migration file in order:
   - Create new query
   - Delete the default "select 1" query
   - Paste entire content of the migration file
   - Click RUN

4. Execute in this order:
   001_auth_schema.sql
   002_community_schema.sql  
   003_quiz_schema.sql

5. Verify in Database → Tables section
  `);
}

runMigrations().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
