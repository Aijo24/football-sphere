import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import path from 'path'

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'))

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    console.log('Fetching posts for user:', params.userId);

    return new Promise((resolve) => {
        const query = `
            SELECT 
                posts.*, 
                users.name as author 
            FROM posts 
            JOIN users ON posts.author_id = users.id 
            WHERE posts.author_id = ?
            ORDER BY posts.created_at DESC
        `;

        db.all(query, [params.userId], (err, posts) => {
            if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json(
                    { error: 'Failed to fetch posts' },
                    { status: 500 }
                ));
                return;
            }

            console.log('Found posts:', posts);
            resolve(NextResponse.json(posts || []));
        });
    });
}