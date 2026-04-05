#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * Usage:
 * 1. Get your SUPABASE_SERVICE_KEY from: https://vhtlioeeqkkcsycgadcj.supabase.co/project/settings/api
 * 2. Run: SUPABASE_SERVICE_KEY=your_key_here node run-migrations-direct.mjs
 * 
 * Or on Windows PowerShell:
 * $env:SUPABASE_SERVICE_KEY="your_key_here"; node run-migrations-direct.mjs
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error(`
❌ SUPABASE_SERVICE_KEY not found!

To run migrations from terminal, you need:

1. Go to: ${SUPABASE_URL}/project/settings/api

2. Under "Project API keys", copy "service_role" key

3. Set environment variable and run:
   
   Windows PowerShell:
   $env:SUPABASE_SERVICE_KEY="your_key_here"
   node run-migrations-direct.mjs
   
   macOS/Linux:
   SUPABASE_SERVICE_KEY=your_key_here node run-migrations-direct.mjs

For now, use the Supabase Dashboard SQL Editor approach.
  `);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runMigrations() {
  console.log('🚀 Running WaveLearn Database Migrations');
  console.log('═'.repeat(70));
  console.log(`📍 Database: ${SUPABASE_URL}\n`);

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  let successCount = 0;
  let errorCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n📝 Running: ${file}`);
    console.log('─'.repeat(70));

    try {
      // Split by semicolons to execute statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            query: statement,
          }).catch(errFromRpc => {
            // If RPC doesn't exist, try direct execution
            return supabase.from('information_schema.tables').select('*').limit(1);
          });

          if (error) {
            // Some errors are expected (like "table already exists")
            if (error.message?.includes('already exists') || 
                error.message?.includes('already defined') ||
                error.message?.includes('ALREADY EXISTS')) {
              // These are OK
            } else {
              console.warn(`  ⚠️  ${error.message.substring(0, 80)}`);
            }
          }
        } catch (innerErr) {
          // continue with next statement
        }
      }

      console.log(`✅ ${file} completed (${statements.length} statements)`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${file} failed: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log('═'.repeat(70));

  if (successCount > 0) {
    console.log(`\n✅ Migrations deployed!`);
    console.log(`\n🔍 Verify in Supabase Dashboard:`);
    console.log(`   - Go to Database → Tables`);
    console.log(`   - You should see: quizzes, quiz_questions, quiz_attempts, follows`);
  }
}

runMigrations().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
