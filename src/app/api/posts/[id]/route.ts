import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const postId = params.id;

        return new Promise<Response>((resolve) => {
            db.get(
                `SELECT 
                    p.*,
                    u.name as author
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.id = ?`,
                [postId],
                (err, post) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to fetch post' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (!post) {
                        resolve(NextResponse.json(
                            { error: 'Post not found' },
                            { status: 404 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json(post));
                }
            );
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const postId = params.id;

        return new Promise<Response>((resolve) => {
            db.run(
                'DELETE FROM posts WHERE id = ?',
                [postId],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to delete post' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (this.changes === 0) {
                        resolve(NextResponse.json(
                            { error: 'Post not found' },
                            { status: 404 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json({ 
                        message: 'Post deleted successfully' 
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const postId = params.id;
        const { title, content, image } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            db.run(
                'UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?',
                [title, content, image, postId],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to update post' },
                            { status: 500 }
                        ));
                        return;
                    }

                    if (this.changes === 0) {
                        resolve(NextResponse.json(
                            { error: 'Post not found' },
                            { status: 404 }
                        ));
                        return;
                    }

                    resolve(NextResponse.json({ 
                        message: 'Post updated successfully' 
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}