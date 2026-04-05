import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw';
const SUPABASE_URL = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODc2MjcsImV4cCI6MjA4OTA2MzYyN30.9xHdaqYdJKdGqHGhC_sZfgYXsR0TTMg0Y-QN7FLT3bI';

const migrationFiles = [
  '001_auth_schema.sql',
  '002_community_schema.sql',
  '003_quiz_schema.sql',
  '004_add_role_column.sql',
  '005_fix_rls_for_user_creation.sql',
  '006_create_user_function.sql',
  '007_fix_rlspolicies_users.sql',
  '008_fix_rls_for_clerk.sql',
  '009_disable_rls_temporary.sql',
  '010_disable_rls_final.sql',
  '011_disable_all_rls.sql',
  '012_drop_all_rls_policies.sql',
];

async function executeSql(sql) {
  console.log('\n📝 Executing SQL...');
  
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

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Response error:', error);
      return false;
    }

    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Execution error:', error);
    return false;
  }
}

async function deployMigrations() {
  console.log('🚀 Starting migration deployment...\n');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Skipping ${file} (file not found)`);
      continue;
    }

    console.log(`\n📄 Deploying ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by ; to execute multiple statements
    const statements = sql.split(';').filter(s => s.trim());
    
    let success = true;
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        const result = await executeSql(trimmed + ';');
        if (!result) {
          success = false;
          break;
        }
      }
    }

    if (success) {
      console.log(`✅ ${file} deployed successfully`);
    } else {
      console.log(`❌ ${file} failed`);
      break;
    }
  }

  console.log('\n🎉 Migration deployment complete!');
}

deployMigrations().catch(console.error);
