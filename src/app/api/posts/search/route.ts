import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            const searchQuery = `%${query}%`;
            
            db.all(
                `SELECT 
                    p.id,
                    p.title,
                    p.content,
                    p.image,
                    p.created_at,
                    u.name as author,
                    p.author_id
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE LOWER(p.title) LIKE LOWER(?)
                   OR LOWER(p.content) LIKE LOWER(?)
                   OR LOWER(u.name) LIKE LOWER(?)
                ORDER BY p.created_at DESC
                LIMIT 15`,
                [searchQuery, searchQuery, searchQuery],
                (err, posts) => {
                    if (err) {
                        console.error('Search error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to search posts' },
                            { status: 500 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json(posts || []));
                }
            );
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}