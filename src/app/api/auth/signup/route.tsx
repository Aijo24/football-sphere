import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function POST(request: Request): Promise<Response> {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            // Check if email already exists
            db.get(
                'SELECT id FROM users WHERE email = ?',
                [email],
                (err, user) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Database error' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (user) {
                        resolve(NextResponse.json(
                            { error: 'Email already exists' },
                            { status: 409 }
                        ));
                        return;
                    }

                    // Hash password and create user
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error('Hashing error:', err);
                            resolve(NextResponse.json(
                                { error: 'Password hashing failed' },
                                { status: 500 }
                            ));
                            return;
                        }

                        db.run(
                            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                            [name, email, hashedPassword, 'USER'],
                            function(err) {
                                if (err) {
                                    console.error('Insert error:', err);
                                    resolve(NextResponse.json(
                                        { error: 'Failed to create user' },
                                        { status: 500 }
                                    ));
                                    return;
                                }

                                resolve(NextResponse.json({
                                    id: this.lastID,
                                    name,
                                    email,
                                    role: 'USER'
                                }));
                            }
                        );
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}