import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function POST(request: Request): Promise<Response> {
    try {
        const { currentPassword, newPassword, userIdToChange } = await request.json();
        console.log('Received request to change password for user:', userIdToChange);

        if (!newPassword || !userIdToChange) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return new Promise<Response>((resolve) => {
            if (!currentPassword) {
                // Admin flow
                db.run(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, userIdToChange],
                    function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            resolve(NextResponse.json(
                                { error: 'Failed to update password' },
                                { status: 500 }
                            ));
                            return;
                        }

                        if (this.changes === 0) {
                            resolve(NextResponse.json(
                                { error: 'User not found' },
                                { status: 404 }
                            ));
                            return;
                        }

                        resolve(NextResponse.json({ 
                            message: 'Password updated successfully' 
                        }));
                    }
                );
            } else {
                // Regular user flow
                db.get(
                    'SELECT password FROM users WHERE id = ?',
                    [userIdToChange],
                    async (err, user) => {
                        if (err) {
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

                        const isValid = await bcrypt.compare(currentPassword, user.password);
                        if (!isValid) {
                            resolve(NextResponse.json(
                                { error: 'Current password is incorrect' },
                                { status: 400 }
                            ));
                            return;
                        }

                        db.run(
                            'UPDATE users SET password = ? WHERE id = ?',
                            [hashedPassword, userIdToChange],
                            (err) => {
                                if (err) {
                                    resolve(NextResponse.json(
                                        { error: 'Failed to update password' },
                                        { status: 500 }
                                    ));
                                    return;
                                }

                                resolve(NextResponse.json({ 
                                    message: 'Password updated successfully' 
                                }));
                            }
                        );
                    }
                );
            }
        });
    } catch (error) {
        console.error('Error in change-password route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}