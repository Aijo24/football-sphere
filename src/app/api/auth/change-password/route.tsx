import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export const POST = async (request: NextRequest) => {
    console.log('API route hit: /api/auth/change-password');

    try {
        const body = await request.json();
        console.log('Received request body:', { ...body, newPassword: '[REDACTED]' });

        const { newPassword, userIdToChange } = body;

        if (!newPassword || !userIdToChange) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return new Promise((resolve) => {
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

                    console.log('Password updated successfully for user:', userIdToChange);
                    resolve(NextResponse.json({ 
                        message: 'Password updated successfully'
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};