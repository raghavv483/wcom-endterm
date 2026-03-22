#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://vhtlioeeqkkcsycgadcj.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('\n📋 Instructions to deploy migration:');
  console.log('');
  console.log('Option 1: Use Supabase Dashboard (Easiest)');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Click on "wavelearn" project');
  console.log('3. Go to SQL Editor in left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Copy the entire content from: supabase/migrations/002_community_schema.sql');
  console.log('6. Paste into the SQL editor');
  console.log('7. Click "Run" button');
  console.log('');
  console.log('Option 2: Use this script');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Click on "wavelearn" project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "service_role" key (NOT the public key)');
  console.log(`5. Run: set SUPABASE_SERVICE_ROLE_KEY=<your_key> && npm run deploy:migration`);
  console.log('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: {
    schema: 'public',
  },
});

async function deployMigration() {
  try {
    const migrationPath = path.join(__dirname, 'supabase/migrations/002_community_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Deploying migration 002_community_schema.sql...\n');

    // Execute the SQL query
    const { data, error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      console.error('❌ Migration deployment failed:');
      console.error(error.message);
      process.exit(1);
    }

    console.log('✅ Migration deployed successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('  • questions');
    console.log('  • answers');
    console.log('  • comments');
    console.log('  • votes');
    console.log('  • user_reputation');
    console.log('');
    console.log('🔒 Enabled Row Level Security (RLS) on all tables');
    console.log('📑 Created RLS policies for authenticated access');
    console.log('🏃 Created indexes for performance optimization');
    console.log('');
    console.log('✨ You can now use the voting, commenting, and reputation features!');
    
  } catch (err) {
    console.error('❌ Deployment error:');
    console.error(err.message);
    process.exit(1);
  }
}

deployMigration();
