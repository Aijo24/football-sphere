import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import path from 'path'

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'))

export async function GET() {
    console.log('Fetching users list');

    return new Promise((resolve) => {
        db.all(
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
}