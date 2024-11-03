import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

interface User {
    id: number;
    name: string;
}

export async function GET(): Promise<Response> {
    try {
        console.log('Fetching users list');

        return new Promise<Response>((resolve) => {
            db.all<User>(
                'SELECT id, name FROM users ORDER BY name ASC',
                [],
                (err, users) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to fetch users' },
                            { status: 500 }
                        ));
                        return;
                    }

                    console.log('Found users:', users);
                    resolve(NextResponse.json(users || []));
                }
            );
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optionally add POST method for creating new users
export async function POST(request: Request): Promise<Response> {
    try {
        const { name, email, password, role = 'USER' } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            // First check if email already exists
            db.get(
                'SELECT id FROM users WHERE email = ?',
                [email],
                (err, existingUser) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to check email' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (existingUser) {
                        resolve(NextResponse.json(
                            { error: 'Email already exists' },
                            { status: 409 }
                        ));
                        return;
                    }

                    // Create new user
                    db.run(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        [name, email, password, role],
                        function(err) {
                            if (err) {
                                console.error('Database error:', err);
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
                                role
                            }));
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optionally add DELETE method for removing users
export async function DELETE(request: Request): Promise<Response> {
    try {
        const { userIds } = await request.json();

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { error: 'User IDs array is required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            const placeholders = userIds.map(() => '?').join(',');
            
            db.run(
                `DELETE FROM users WHERE id IN (${placeholders})`,
                userIds,
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to delete users' },
                            { status: 500 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json({ 
                        message: 'Users deleted successfully',
                        count: this.changes
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error deleting users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}