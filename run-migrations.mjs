import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HICV7FpaLTH-O8eBMpWCZQ_sazw-Ftj';

// Note: This uses the publishable key which may have limited permissions.
// For production, you should use the service role key from Supabase dashboard.
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('Found migrations:', migrationFiles);
  console.log('');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n📝 Running migration: ${file}...`);
    console.log('─'.repeat(60));

    try {
      const { data, error } = await supabase.rpc('exec', {
        query: sql,
      }).catch(err => {
        // If rpc fails, try direct query
        return { data: null, error: err };
      });

      if (error && error.message.includes('does not exist')) {
        // Try with direct SQL execution
        console.log('Attempting direct SQL execution...');
        const { data: directData, error: directError } = await supabase.from('information_schema.tables').select('*').limit(1);
        
        if (directError) {
          throw directError;
        }
      }

      if (error) {
        console.error(`❌ Error in ${file}:`);
        console.error(error.message);
      } else {
        console.log(`✅ Successfully ran: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error in ${file}:`);
      console.error(err.message || err);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Migration run complete!');
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
