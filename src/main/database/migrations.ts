import type { DatabaseSync } from 'node:sqlite';
import { librarySchemaSql, schemaMigrationTableSql } from './schema';

type Migration = {
  id: number;
  sql: string;
};

export const migrations: Migration[] = [
  {
    id: 1,
    sql: librarySchemaSql,
  },
];

export const runMigrations = (database: DatabaseSync): void => {
  database.exec(schemaMigrationTableSql);

  const appliedRows = database.prepare('SELECT id FROM schema_migrations').all();
  const appliedIds = new Set(appliedRows.map((row) => Number(row.id)));

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) {
      continue;
    }

    database.exec('BEGIN');

    try {
      database.exec(migration.sql);
      database
        .prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)')
        .run(migration.id, new Date().toISOString());
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
};
