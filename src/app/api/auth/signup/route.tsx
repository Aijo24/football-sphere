import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function POST(request: Request): Promise<Response> {
    try {
        const { name, password } = await request.json();

        if (!name || !password) {
            return NextResponse.json(
                { error: 'Name and password are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
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
                    'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
                    [name, hashedPassword, 'USER'],
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
                            role: 'USER'
                        }));
                    }
                );
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}