import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const userId = params.id;

        return new Promise<Response>((resolve) => {
            db.all(
                `SELECT 
                    p.*,
                    u.name as author
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.author_id = ?
                ORDER BY p.created_at DESC`,
                [userId],
                (err, posts) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to fetch posts' },
                            { status: 500 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json(posts || []));
                }
            );
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}