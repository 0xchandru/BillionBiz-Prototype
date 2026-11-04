import { query } from './pool.js';
import { runMigrations } from './migrate.js';
import { seedDatabase } from './seed.js';

export async function resetDatabase() {
  console.log('[Reset] ========================================================');
  console.log('[Reset] Starting BillionBiz full database reset...');
  console.log('[Reset] ========================================================');

  // 1. Fetch all user tables in public schema
  const tablesRes = await query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);

  const tableNames = tablesRes.rows.map((r: any) => r.tablename);
  console.log(`[Reset] Found ${tableNames.length} tables to truncate.`);

  if (tableNames.length > 0) {
    const quotedTables = tableNames.map((t: string) => `"${t}"`).join(', ');
    await query(`TRUNCATE TABLE ${quotedTables} CASCADE;`);
    console.log('[Reset] Truncated all tables CASCADE.');
  }

  // 2. Run migrations to ensure all indexes, tables and schema constraints exist
  console.log('[Reset] Re-running schema migrations...');
  await runMigrations();

  // 3. Seed production essentials
  console.log('[Reset] Seeding clean production data...');
  await seedDatabase();

  console.log('[Reset] ========================================================');
  console.log('[Reset] Database reset and clean production seed completed!');
  console.log('[Reset] All active sessions revoked.');
  console.log('[Reset] ========================================================');
}

if (process.argv[1] && process.argv[1].endsWith('reset_db.ts')) {
  resetDatabase()
    .then(() => {
      console.log('[Reset] Process exiting successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Reset] Reset failed:', err);
      process.exit(1);
    });
}

