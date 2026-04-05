#!/usr/bin/env node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to get connection string from environment, or construct from parts
const getConnectionString = () => {
  // Try environment variable first
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Construct from Supabase defaults
  // Format: postgresql://postgres.{project-id}:{password}@db.{project-id}.supabase.co:5432/postgres
  const projectId = 'vhtlioeeqkkcsycgadcj';
  const password = process.env.SUPABASE_DB_PASSWORD || '';
  
  if (!password) {
    return null;
  }
  
  return `postgresql://postgres.${projectId}:${password}@db.${projectId}.supabase.co:5432/postgres`;
};

// Migration files to deploy
const migrationsToRun = [
  '003_quiz_schema.sql',  // Creates quiz tables
  '012_drop_all_rls_policies.sql',  // Disables RLS
];

async function promptForPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question('Enter your Supabase database password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function runMigration(client, filePath, filename) {
  try {
    console.log(`\n📝 Running: ${filename}`);
    console.log('-'.repeat(60));
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolons but preserve the statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Show progress for every 5 statements
      if ((i + 1) % 5 === 0 || i === 0) {
        console.log(`  Running statement ${i + 1}/${statements.length}...`);
      }
      
      await client.query(statement);
    }
    
    console.log(`✅ ${filename} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 WaveLearn Database Migration Deployment');
  console.log('═'.repeat(60));
  
  try {
    // Get connection string
    let connectionString = getConnectionString();
    
    if (!connectionString) {
      console.log('\n⚠️  Database connection string not found');
      console.log('\nPlease provide your Supabase database password.');
      console.log('You can find this in:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to: Settings > Database');
      console.log('4. Copy the password displayed there');
      console.log('');
      
      const password = await promptForPassword();
      if (!password) {
        console.log('\n❌ No password provided');
        process.exit(1);
      }
      
      const projectId = 'vhtlioeeqkkcsycgadcj';
      connectionString = `postgresql://postgres.${projectId}:${password}@db.${projectId}.supabase.co:5432/postgres`;
    }
    
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },  // Supabase uses SSL
      statement_timeout: 30000,  // 30 second timeout per statement
    });
    
    // Connect to database
    console.log('\n🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');
    
    // Run migrations
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    let allSuccess = true;
    
    for (const filename of migrationsToRun) {
      const filePath = path.join(migrationsDir, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filename} (not found)`);
        continue;
      }
      
      const success = await runMigration(client, filePath, filename);
      if (!success) {
        allSuccess = false;
        break; // Stop on first error
      }
    }
    
    await client.end();
    
    console.log('\n' + '═'.repeat(60));
    if (allSuccess) {
      console.log('🎉 All migrations deployed successfully!');
      console.log('\n✅ You can now:');
      console.log('   1. Refresh your browser (F5)');
      console.log('   2. Open Admin Dashboard');
      console.log('   3. Create your first quiz!');
    } else {
      console.log('❌ Migration deployment failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: Check your database password and try again');
    }
    process.exit(1);
  }
}

main();

