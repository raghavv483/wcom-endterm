import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get Supabase credentials from environment or use defaults
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('\nTo deploy migrations:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your "wavelearn" project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "service_role" secret key');
  console.log('5. Run: set SUPABASE_SERVICE_ROLE_KEY=your_key && node deploy-sql.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMigration() {
  try {
    const migrationPath = path.join(__dirname, 'supabase/migrations/002_community_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Deploying migration...');
    console.log('File:', migrationPath);
    
    const { error } = await supabase.rpc('execute_sql', { sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration deployed successfully!');
    console.log('The votes table and RLS policies are now active.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

deployMigration();
