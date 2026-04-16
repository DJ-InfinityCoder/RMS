/**
 * One-time seed script: Assigns 1000 loyalty points to all existing users
 * who currently have 0 or NULL loyalty_points.
 *
 * Usage:  node scripts/seed-loyalty-points.js
 *
 * Prerequisites:
 *   - .env must contain EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   - The `loyalty_points` column must already exist in the `users` table
 *     (run: ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 1000;)
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// ─── Load .env manually (no dotenv dependency) ──────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...rest] = trimmed.split('=');
  let value = rest.join('=').trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
  envVars[key.trim()] = value;
});

const SUPABASE_URL = envVars.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOYALTY_POINTS_INITIAL = 1000;

async function seedLoyaltyPoints() {
  console.log('🚀  Starting loyalty points seed...');
  console.log(`    Target: ${LOYALTY_POINTS_INITIAL} points for all existing users\n`);

  // Step 1: Add the column if it doesn't exist (safe to run multiple times)
  // This is done via raw SQL through Supabase RPC or directly in dashboard.
  // The script will just UPDATE users that have 0 or NULL points.

  // Step 2: Fetch all users with 0 or no loyalty points
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, full_name, loyalty_points')
    .or('loyalty_points.is.null,loyalty_points.eq.0');

  if (fetchError) {
    console.error('❌  Error fetching users:', fetchError.message);

    // If column doesn't exist, guide the user
    if (fetchError.message.includes('loyalty_points')) {
      console.log('\n📋  The loyalty_points column may not exist yet.');
      console.log('    Run this SQL in Supabase Dashboard → SQL Editor:\n');
      console.log('    ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 1000;\n');
      console.log('    Then re-run this script.');
    }
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✅  All users already have loyalty points assigned. Nothing to do.');
    return;
  }

  console.log(`📦  Found ${users.length} user(s) needing loyalty points:\n`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ loyalty_points: LOYALTY_POINTS_INITIAL })
      .eq('id', user.id);

    if (updateError) {
      console.log(`   ❌  ${user.full_name} (${user.id}): ${updateError.message}`);
      failCount++;
    } else {
      console.log(`   ✅  ${user.full_name}: ${LOYALTY_POINTS_INITIAL} pts assigned`);
      successCount++;
    }
  }

  console.log(`\n── Summary ──────────────────────────────────`);
  console.log(`   ✅ Updated: ${successCount}`);
  console.log(`   ❌ Failed:  ${failCount}`);
  console.log(`   📊 Total:   ${users.length}`);
  console.log(`─────────────────────────────────────────────\n`);
}

seedLoyaltyPoints()
  .then(() => {
    console.log('🎉  Seed script completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥  Unexpected error:', err);
    process.exit(1);
  });
