import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw';
const SUPABASE_URL = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODc2MjcsImV4cCI6MjA4OTA2MzYyN30.9xHdaqYdJKdGqHGhC_sZfgYXsR0TTMg0Y-QN7FLT3bI';

console.log('⚠️  Manual SQL Deployment Instructions');
console.log('═'.repeat(60));
console.log('');
console.log('The database migration needs to be run manually');
console.log('because arbitrary SQL execution requires direct DB access.');
console.log('');
console.log('📋 STEP-BY-STEP DEPLOYMENT:');
console.log('-'.repeat(60));
console.log('');
console.log('1. Go to Supabase Dashboard:');
console.log('   ' + SUPABASE_URL + '/dashboard');
console.log('');
console.log('2. Select Project: wavelearn');
console.log('');
console.log('3. Go to: SQL Editor (left sidebar)');
console.log('');
console.log('4. Create a new query and paste this SQL:');
console.log('');
console.log('-'.repeat(60));

// Read and display the key migration files
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const keyMigrations = [
  '003_quiz_schema.sql',  // This creates the quizzes table
];

for (const file of keyMigrations) {
  const filepath = path.join(migrationsDir, file);
  if (fs.existsSync(filepath)) {
    const sql = fs.readFileSync(filepath, 'utf8');
    console.log('\n-- FROM FILE: ' + file);
    console.log('-'.repeat(60));
    console.log(sql);
    console.log('-'.repeat(60));
  }
}

console.log('');
console.log('5. Click "Run" or press Ctrl+Enter');
console.log('');
console.log('6. Wait for completion (should see "✓ All done" message)');
console.log('');
console.log('═'.repeat(60));
console.log('✅ After deployment, refresh your browser and try creating a quiz!');
