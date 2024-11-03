import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function POST(request: Request): Promise<Response> {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err, user) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Database error' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (!user) {
                        resolve(NextResponse.json(
                            { error: 'User not found' },
                            { status: 404 }
                        ));
                        return;
                    }

                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) {
                        resolve(NextResponse.json(
                            { error: 'Invalid password' },
                            { status: 401 }
                        ));
                        return;
                    }

                    const { password: _, ...userWithoutPassword } = user;
                    resolve(NextResponse.json(userWithoutPassword));
                }
            );
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}