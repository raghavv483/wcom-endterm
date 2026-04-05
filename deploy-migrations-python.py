#!/usr/bin/env python3
import os
import glob
import subprocess

# Supabase connection details
DATABASE_URL = "postgresql://postgres.vhtlioeeqkkcsycgadcj:[PASSWORD]@db.vhtlioeeqkkcsycgadcj.supabase.co:5432/postgres"

# List of migrations to deploy
migrations = [
    "001_auth_schema.sql",
    "002_community_schema.sql", 
    "003_quiz_schema.sql",
    "004_add_role_column.sql",
    "005_fix_rls_for_user_creation.sql",
    "006_create_user_function.sql",
    "007_fix_rlspolicies_users.sql",
    "008_fix_rls_for_clerk.sql",
    "009_disable_rls_temporary.sql",
    "010_disable_rls_final.sql",
    "011_disable_all_rls.sql",
    "012_drop_all_rls_policies.sql",
]

migrations_dir = "supabase/migrations"

print("🚀 Deploying migrations...")
print("=" * 60)

for migration in migrations:
    filepath = os.path.join(migrations_dir, migration)
    
    if not os.path.exists(filepath):
        print(f"⚠️  Skipping {migration} (not found)")
        continue
    
    print(f"\n📝 Deploying: {migration}")
    print("-" * 60)
    
    try:
        with open(filepath, 'r') as f:
            sql = f.read()
        
        # Execute using psql if DATABASE_URL is available
        if "PASSWORD" in DATABASE_URL:
            print("❌ Database password not set. Cannot deploy.")
            print("\nTo deploy:")
            print("1. Get your database password from Supabase Settings > Database")
            print("2. Update DATABASE_URL in this script")
            print("3. Run: python3 deploy-migrations.py")
            break
        
        # For now, just show what would be deployed
        lines = sql.count('\n')
        statements = sql.count(';')
        print(f"File size: {len(sql)} bytes")
        print(f"Lines: {lines}")
        print(f"SQL statements: {statements}")
        print(f"✅ Ready to deploy")
        
    except Exception as e:
        print(f"❌ Error reading {migration}: {e}")

print("\n" + "=" * 60)
print("📋 To deploy the migrations:")
print("1. Go to https://supabase.com/dashboard")
print("2. Open SQL Editor")
print("3. Copy and paste the SQL from each migration file")
print("4. Or use: supabase db push")
