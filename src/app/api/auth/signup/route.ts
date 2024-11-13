import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function getDb() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
        return await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, password } = body;

        console.log('Signup attempt for:', { name });

        let db;
        try {
            db = await getDb();

            // Check if user already exists
            const existingUser = await db.get(
                'SELECT * FROM users WHERE name = ?',
                [name]
            );

            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Username already exists' },
                    { status: 400 }
                );
            }

            // Insert new user
            const result = await db.run(
                'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
                [name, password, 'user']
            );

            console.log('User created:', result);

            // Verify the user was created correctly
            const newUser = await db.get(
                'SELECT * FROM users WHERE id = ?',
                [result.lastID]
            );
            console.log('New user verification:', newUser);

            return NextResponse.json({
                success: true,
                user: {
                    id: result.lastID,
                    name: name,
                    role: 'user'
                }
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { success: false, error: 'Database error' },
                { status: 500 }
            );
        } finally {
            if (db) await db.close();
        }

    } catch (error) {
        console.error('Signup route error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}