/**
 * Nailed It Property Solutions - Supabase Database Migration Runner
 * Run via: npx ts-node scripts/run_supabase_migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const MIGRATION_PATH = path.join(ROOT_DIR, 'supabase', 'migrations', '20261005_add_work_agreement_payment_fields.sql');

async function main() {
  console.log('==============================================================================');
  console.log('⚡ NAILED IT PROPERTY SOLUTIONS - SUPABASE SCHEMA MIGRATION');
  console.log('==============================================================================\n');

  if (!fs.existsSync(MIGRATION_PATH)) {
    console.error(`❌ Migration file not found at: ${MIGRATION_PATH}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(MIGRATION_PATH, 'utf-8');

  // Load .env.local if present
  const envPath = path.join(ROOT_DIR, '.env.local');
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || '';

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
      if ((key === 'DATABASE_URL' || key === 'POSTGRES_URL' || key === 'SUPABASE_DB_URL') && !dbUrl) dbUrl = val;
    }
  }

  console.log(`📁 Target Migration: supabase/migrations/20261005_add_work_agreement_payment_fields.sql`);
  console.log(`🌐 Supabase Project URL: ${supabaseUrl || '(Configured via App UI)'}\n`);

  console.log('------------------------------------------------------------------------------');
  console.log('📋 SQL MIGRATION SCRIPT TO EXECUTE:');
  console.log('------------------------------------------------------------------------------');
  console.log(sqlContent.trim());
  console.log('------------------------------------------------------------------------------\n');

  console.log('🚀 HOW TO RUN THIS IN SUPABASE:');
  console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project -> Click "SQL Editor" in the left sidebar.');
  console.log('3. Click "New query", paste the SQL script above, and click "Run".');
  console.log('\n✨ (Alternatively, open the app UI -> click "Cloud Sync" in the header -> go to "Schema / SQL" tab -> click "Copy Migration SQL"!)');
  console.log('\n🔒 Resilient Sync Note:');
  console.log('   The client sync engine (src/lib/supabaseSync.ts) has been updated with automatic');
  console.log('   column fallback. Data syncing will continue operating seamlessly both before and');
  console.log('   after this migration is executed.\n');
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
