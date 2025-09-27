import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema';

const sqlite = new Database('shelterconnect.db');
const db = drizzle(sqlite, { schema });

// Create tables
async function runMigrations() {
  console.log('Running database migrations...');
  
  // Drop existing tables if they exist (for clean migration)
  await db.run(`DROP TABLE IF EXISTS adoption_inquiries`);
  await db.run(`DROP TABLE IF EXISTS clicks`);
  await db.run(`DROP TABLE IF EXISTS amplify_tasks`);
  await db.run(`DROP TABLE IF EXISTS post_assets`);
  await db.run(`DROP TABLE IF EXISTS dogs`);
  await db.run(`DROP TABLE IF EXISTS volunteers`);
  await db.run(`DROP TABLE IF EXISTS shelters`);
  
  // Create all tables with proper field names matching the schema
  await db.run(`
    CREATE TABLE IF NOT EXISTS shelters (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zipcode TEXT,
      website TEXT,
      primary_contact TEXT,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS dogs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      shelter_id TEXT NOT NULL REFERENCES shelters(id),
      name TEXT NOT NULL,
      age_years REAL NOT NULL,
      sex TEXT NOT NULL,
      breed_guess TEXT,
      weight_lbs REAL NOT NULL,
      temperament TEXT NOT NULL,
      bio TEXT,
      intake_date INTEGER,
      euthanasia_risk INTEGER NOT NULL DEFAULT 0,
      adoption_deadline INTEGER,
      urgency_level TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Available',
      photo_url TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS post_assets (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      dog_id TEXT NOT NULL REFERENCES dogs(id),
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      social_handles TEXT DEFAULT '{}',
      preferred_channels TEXT DEFAULT '[]',
      location TEXT,
      city TEXT,
      state TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS amplify_tasks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      dog_id TEXT NOT NULL REFERENCES dogs(id),
      volunteer_id TEXT REFERENCES volunteers(id),
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      share_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      expires_at INTEGER
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS clicks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      dog_id TEXT NOT NULL REFERENCES dogs(id),
      source TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS adoption_inquiries (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      dog_id TEXT NOT NULL REFERENCES dogs(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create indexes for better performance
  await db.run(`CREATE INDEX IF NOT EXISTS idx_shelters_email ON shelters(email)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_shelters_city_state ON shelters(city, state)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_dogs_shelter_id ON dogs(shelter_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_dogs_slug ON dogs(slug)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_amplify_tasks_dog_id ON amplify_tasks(dog_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_amplify_tasks_status ON amplify_tasks(status)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_clicks_dog_id ON clicks(dog_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_adoption_inquiries_dog_id ON adoption_inquiries(dog_id)`);

  console.log('Database migrations completed successfully!');
  sqlite.close();
}

runMigrations().catch(console.error);
