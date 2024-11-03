const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

async function createTables() {
    try {
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Create users table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK( role IN ('USER','ADMIN') ) DEFAULT 'USER',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Drop existing posts table
        db.run(`DROP TABLE IF EXISTS posts`);

        // Create posts table with new schema
        db.run(`
            CREATE TABLE posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                image TEXT,
                author_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )
        `);

        // Insert a test admin user if it doesn't exist
        const testPassword = await bcrypt.hash('admin123', 10);
        db.run(`
            INSERT OR IGNORE INTO users (name, password, role)
            VALUES (?, ?, ?)
        `, ['admin', testPassword, 'ADMIN']);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

createTables().then(() => {
    db.close();
});