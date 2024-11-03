import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

interface User {
    id: string;
    name: string;
    role: string;
}

export async function POST(request: Request) {
    console.log('Login API route hit');

    try {
        const data = await request.json();
        console.log('Received login data:', { ...data, password: '[REDACTED]' });

        const { username, password } = data;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        return new Promise((resolve) => {
            // Use LOWER() function to make the search case-insensitive
            db.get(
                'SELECT * FROM users WHERE LOWER(name) = LOWER(?)',
                [username],
                async (err, user) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                        return;
                    }

                    if (!user) {
                        resolve(NextResponse.json({ error: 'Invalid username or password' }, { status: 401 }));
                        return;
                    }

                try {
                    const passwordMatch = await bcrypt.compare(password, (user as User & { password: string }).password);

                        if (!passwordMatch) {
                            resolve(NextResponse.json({ error: 'Invalid username or password' }, { status: 401 }));
                            return;
                        }

                    // Create user data object
                    const userData = {
                        id: (user as User).id,
                        name: (user as User).name,
                        role: (user as User).role
                    };

                        // Create response with user data
                        const response = NextResponse.json({
                            success: true,
                            user: userData
                        }, { status: 200 });

                        // Set cookie in response headers
                        response.cookies.set('user', JSON.stringify(userData), {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            path: '/'
                        });

                        resolve(response);
                    } catch (error) {
                        console.error('Password comparison error:', error);
                        resolve(NextResponse.json({ error: 'Authentication error' }, { status: 500 }));
                    }
                }
            );
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}