import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the migration file
const migrationPath = path.join(__dirname, "supabase/migrations/002_community_schema.sql");
const migrationSQL = fs.readFileSync(migrationPath, "utf8");

console.log("Migration SQL loaded successfully!");
console.log("SQL file size:", migrationSQL.length, "characters");
console.log("\nTo deploy this migration to your Supabase database:");
console.log("1. Go to https://supabase.com/dashboard");
console.log("2. Select your 'wavelearn' project");
console.log("3. Go to SQL Editor");
console.log("4. Click 'New query'");
console.log("5. Copy and paste the SQL below:");
console.log("\n" + "=".repeat(80));
console.log(migrationSQL);
console.log("=".repeat(80));
