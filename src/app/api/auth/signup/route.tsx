import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

// Initialize database
const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function POST(req: Request) {
    console.log('API route hit'); // Debug log

    try {
        const data = await req.json();
        console.log('Received data:', { ...data, password: '[REDACTED]' }); // Debug log

        const { username, password } = data;

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        return new Promise((resolve) => {
            // Check if user exists
            db.get('SELECT name FROM users WHERE name = ?', [username], async (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                    return;
                }

                if (row) {
                    resolve(NextResponse.json({ error: 'Username already exists' }, { status: 400 }));
                    return;
                }

                // Hash password and create user
                const hashedPassword = await bcrypt.hash(password, 10);
                
                db.run(
                    'INSERT INTO users (name, password, email, role) VALUES (?, ?, ?, ?)',
                    [username, hashedPassword, '', 'USER'],
                    function(err) {
                        if (err) {
                            console.error('Insert error:', err);
                            resolve(NextResponse.json({ error: 'Failed to create user' }, { status: 500 }));
                            return;
                        }

                        resolve(NextResponse.json({ 
                            success: true, 
                            message: 'User created successfully',
                            id: this.lastID,
                            name: username,
                            role: 'USER'
                        }, { status: 201 }));
                    }
                );
            });
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}