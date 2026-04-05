import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vhtlioeeqkkcsycgadcj.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLSAndFixUsers() {
  console.log("🚀 Starting RLS disable and user creation fix...\n");

  try {
    // Raw SQL commands to disable RLS
    const sqlCommands = [
      // Drop all policies
      `DROP POLICY IF EXISTS "Allow read all" ON users;`,
      `DROP POLICY IF EXISTS "Allow insert all" ON users;`,
      `DROP POLICY IF EXISTS "Allow update all" ON users;`,

      // Disable RLS on users table
      `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`,

      // Verify RLS is disabled
      `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename='users';`,
    ];

    for (const sql of sqlCommands) {
      console.log(`📝 Executing: ${sql.substring(0, 60)}...`);
      const { data, error } = await supabase.rpc("exec_sql", { sql });

      if (error) {
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success\n`);
      }
    }

    // Try to directly insert a test user
    console.log("👤 Attempting to create test user...");
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: "test@example.com",
        username: "testuser",
        password_hash: "test_hash",
        role: "user",
      })
      .select()
      .single();

    if (insertError) {
      console.error(`❌ Insert error: ${insertError.message}`);
    } else {
      console.log(`✅ Test user created:`, newUser);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

disableRLSAndFixUsers();
