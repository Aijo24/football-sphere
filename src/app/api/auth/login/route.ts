import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function getDb() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
        console.log('Attempting to connect to database at:', dbPath);
        
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
        const { username, password } = body;

        console.log('Login attempt with:', { username, password });

        let db;
        try {
            db = await getDb();
            
            // First, let's check if the database has any users
            const allUsers = await db.all('SELECT * FROM users');
            console.log('All users in database:', allUsers);

            // Now try to find our specific user
            const user = await db.get(
                'SELECT * FROM users WHERE name = ?', 
                [username]
            );
            console.log('Found user:', user);

            if (!user) {
                console.log('No user found with this username');
                return NextResponse.json(
                    { success: false, error: 'User not found' },
                    { status: 401 }
                );
            }

            // Check password
            if (user.password !== password) {
                console.log('Password mismatch');
                return NextResponse.json(
                    { success: false, error: 'Invalid password' },
                    { status: 401 }
                );
            }

            // If we get here, login is successful
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            cookies().set('user', JSON.stringify(userData), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60
            });

            return NextResponse.json({
                success: true,
                user: userData
            });

        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: 'Database error' },
                { status: 500 }
            );
        } finally {
            if (db) await db.close();
        }

    } catch (error) {
        console.error('Login route error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
