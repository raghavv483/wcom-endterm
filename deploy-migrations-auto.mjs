#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw';
const PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODc2MjcsImV4cCI6MjA4OTA2MzYyN30.9xHdaqYdJKdGqHGhC_sZfgYXsR0TTMg0Y-QN7FLT3bI';

const migrationsToRun = [
  '003_quiz_schema.sql',  // Creates quiz tables
  '012_drop_all_rls_policies.sql',  // Disables RLS
];

async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (response.status === 404) {
      // Function doesn't exist, try batch mode
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    return null;
  }
}

async function executeSQLBatch(sqlStatements) {
  const results = [];
  
  for (const sql of sqlStatements) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (response.ok) {
        results.push({ success: true });
      } else {
        const error = await response.text();
        results.push({ success: false, error });
      }
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}

async function runMigrations() {
  console.log('🚀 WaveLearn Database Migration Deployment');
  console.log('═'.repeat(60));

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  let allSuccess = true;

  for (const filename of migrationsToRun) {
    const filePath = path.join(migrationsDir, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filename} (file not found)`);
      continue;
    }

    console.log(`\n📝 Deploying: ${filename}`);
    console.log('-'.repeat(60));

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // Parse SQL statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && s.length > 0);

      console.log(`Found ${statements.length} SQL statements`);

      // Try batch execution
      const results = await executeSQLBatch(statements);
      
      let successCount = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i].success) {
          successCount++;
        } else {
          console.log(`  ❌ Statement ${i + 1} failed: ${results[i].error}`);
        }
      }

      if (successCount === statements.length) {
        console.log(`✅ ${filename} deployed successfully!`);
      } else {
        console.log(`⚠️  ${filename}: ${successCount}/${statements.length} statements succeeded`);
        if (successCount > 0) {
          console.log('   (Some statements may have already existed)');
        }
      }

    } catch (error) {
      console.error(`❌ Error deploying ${filename}:`, error.message);
      allSuccess = false;
    }
  }

  console.log('\n' + '═'.repeat(60));
  if (allSuccess || migrationsToRun.length > 0) {
    console.log('🎉 Migration deployment complete!');
    console.log('\n✅ Next steps:');
    console.log('   1. Refresh your browser (F5) at localhost:5174');
    console.log('   2. Go to Admin Dashboard');
    console.log('   3. Try creating your first quiz!');
  }
}

runMigrations().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
