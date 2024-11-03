import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    role: string;
    created_at?: string;
}

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
            db.get<User>(
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

                    if (!user || !user.password) {
                        resolve(NextResponse.json(
                            { error: 'User not found' },
                            { status: 404 }
                        ));
                        return;
                    }

                    try {
                        const isValid = await bcrypt.compare(password, user.password);
                        if (!isValid) {
                            resolve(NextResponse.json(
                                { error: 'Invalid password' },
                                { status: 401 }
                            ));
                            return;
                        }

                        // Type-safe way to omit password
                        const { password: _, ...userWithoutPassword } = user;
                        
                        resolve(NextResponse.json({
                            user: userWithoutPassword,
                            message: 'Login successful'
                        }));
                    } catch (bcryptError) {
                        console.error('Password comparison error:', bcryptError);
                        resolve(NextResponse.json(
                            { error: 'Authentication failed' },
                            { status: 500 }
                        ));
                    }
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

// Optional: Add a route to check if user is logged in
export async function GET(request: Request): Promise<Response> {
    try {
        // Here you would typically check the session/token
        // For now, we'll just return an unauthorized status
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}