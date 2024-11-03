import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function GET(): Promise<Response> {
    try {
        return new Promise<Response>((resolve) => {
            db.all(
                `SELECT 
                    p.*,
                    u.name as author
                FROM posts p
                JOIN users u ON p.author_id = u.id
                ORDER BY p.created_at DESC`,
                [],
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
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { title, content, image, author_id } = await request.json();

        if (!title || !content || !author_id) {
            return NextResponse.json(
                { error: 'Title, content, and author_id are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            db.run(
                `INSERT INTO posts (title, content, image, author_id, created_at) 
                VALUES (?, ?, ?, ?, datetime('now'))`,
                [title, content, image, author_id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to create post' },
                            { status: 500 }
                        ));
                        return;
                    }

                    // Get the created post with author information
                    db.get(
                        `SELECT 
                            p.*,
                            u.name as author
                        FROM posts p
                        JOIN users u ON p.author_id = u.id
                        WHERE p.id = ?`,
                        [this.lastID],
                        (err, post) => {
                            if (err) {
                                console.error('Error fetching created post:', err);
                                resolve(NextResponse.json(
                                    { error: 'Post created but failed to fetch details' },
                                    { status: 500 }
                                ));
                                return;
                            }

                            resolve(NextResponse.json(post));
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Add a DELETE method to delete multiple posts
export async function DELETE(request: Request): Promise<Response> {
    try {
        const { postIds } = await request.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json(
                { error: 'Post IDs array is required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            const placeholders = postIds.map(() => '?').join(',');
            
            db.run(
                `DELETE FROM posts WHERE id IN (${placeholders})`,
                postIds,
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to delete posts' },
                            { status: 500 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json({ 
                        message: 'Posts deleted successfully',
                        count: this.changes
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error deleting posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}