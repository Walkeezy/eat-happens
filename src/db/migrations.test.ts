import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsFolder = join(process.cwd(), 'drizzle');

type JournalEntry = { idx: number; when: number; tag: string };

async function readJournal(): Promise<JournalEntry[]> {
  const raw = await readFile(join(migrationsFolder, 'meta', '_journal.json'), 'utf8');
  return (JSON.parse(raw) as { entries: JournalEntry[] }).entries;
}

describe('migration journal', () => {
  it('has a SQL file for every entry', async () => {
    const entries = await readJournal();

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(existsSync(join(migrationsFolder, `${entry.tag}.sql`))).toBe(true);
    }
  });

  it('lists entries in idx order', async () => {
    const entries = await readJournal();

    expect(entries.map((entry) => entry.idx)).toEqual(entries.map((_, index) => index));
  });

  // Drizzle records `when` as the applied migration's `created_at` and skips every migration whose
  // `when` is not greater than the highest `created_at` in the database. A journal that is not
  // strictly increasing therefore skips migrations silently, and the app crashes later on a column
  // that was never created.
  it('has strictly increasing timestamps', async () => {
    const entries = await readJournal();

    for (let index = 1; index < entries.length; index++) {
      const previous = entries[index - 1];
      const current = entries[index];

      expect(
        current.when,
        `${current.tag} (${current.when}) must come after ${previous.tag} (${previous.when})`,
      ).toBeGreaterThan(previous.when);
    }
  });
});
