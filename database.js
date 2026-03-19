/**
 * Database Module - SQLite with better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.db');
let db;

// Initialize database
function initialize() {
    db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        -- Exercise groups table
        CREATE TABLE IF NOT EXISTS exercise_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            display_order INTEGER DEFAULT 0
        )
    `);

    db.exec(`
        -- Exercises table
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER,
            name TEXT NOT NULL,
            image TEXT,
            description TEXT,
            difficulty TEXT CHECK(difficulty IN ('Легкий', 'Середній', 'Складний')),
            muscle TEXT,
            sets TEXT,
            instructions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES exercise_groups(id)
        )
    `);

    db.exec(`
        -- User completed exercises table
        CREATE TABLE IF NOT EXISTS user_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exercise_id) REFERENCES exercises(id),
            UNIQUE(user_id, exercise_id, completed_at)
        )
    `);

    db.exec(`
        -- Workout logs table (sets/reps/weight)
        CREATE TABLE IF NOT EXISTS workout_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            workout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            sets INTEGER,
            reps INTEGER,
            weight_kg REAL,
            duration_seconds INTEGER,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        )
    `);

    db.exec(`
        -- Workout plans table
        CREATE TABLE IF NOT EXISTS workout_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            exercises_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    db.exec(`
        -- Personal records table
        CREATE TABLE IF NOT EXISTS personal_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            record_type TEXT CHECK(record_type IN ('weight', 'reps', 'duration')),
            value REAL NOT NULL,
            achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        )
    `);

    // Insert default exercise groups
    const groups = [
        { name: 'Грудь', icon: '💪', order: 1 },
        { name: 'Спина', icon: '🔙', order: 2 },
        { name: 'Біцепс', icon: '💪', order: 3 },
        { name: 'Тріцепс', icon: '🔥', order: 4 },
        { name: 'Ноги', icon: '🦵', order: 5 },
        { name: 'Плечі', icon: '🎯', order: 6 },
        { name: 'Трапеції', icon: '⛰️', order: 7 },
        { name: 'Передпліччя', icon: '🤜', order: 8 },
        { name: 'Пресс', icon: '🔥', order: 9 }
    ];

    const insertGroup = db.prepare(`
        INSERT OR IGNORE INTO exercise_groups (name, icon, display_order)
        VALUES (?, ?, ?)
    `);

    groups.forEach(g => insertGroup.run(g.name, g.icon, g.order));

    console.log('✅ Database initialized successfully');
    return db;
}

// Get database instance
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initialize() first.');
    }
    return db;
}

// Close database connection
function close() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    initialize,
    getDb,
    close
};
