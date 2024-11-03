import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import path from 'path'

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'))

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    return new Promise((resolve) => {
        db.all(
            `SELECT posts.*, users.name as author 
             FROM posts 
             JOIN users ON posts.author_id = users.id 
             WHERE posts.author_id = ? 
             ORDER BY posts.created_at DESC`,
            [params.id],
            (err, posts) => {
                if (err) {
                    resolve(NextResponse.json(
                        { error: 'Failed to fetch posts' },
                        { status: 500 }
                    ));
                    return;
                }

                resolve(NextResponse.json(posts));
            }
        );
    });
}