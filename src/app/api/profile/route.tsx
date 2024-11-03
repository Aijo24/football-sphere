import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        if (!params?.id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            db.all(
                `SELECT 
                    posts.*, 
                    users.name as author 
                FROM posts 
                JOIN users ON posts.author_id = users.id 
                WHERE posts.author_id = ? 
                ORDER BY posts.created_at DESC`,
                [params.id],
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
        console.error('Error fetching profile posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optionally add PUT method for profile updates
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const { name, email } = await request.json();

        if (!params?.id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!name && !email) {
            return NextResponse.json(
                { error: 'At least one field to update is required' },
                { status: 400 }
            );
        }

        return new Promise<Response>((resolve) => {
            const updates: string[] = [];
            const values: any[] = [];

            if (name) {
                updates.push('name = ?');
                values.push(name);
            }
            if (email) {
                updates.push('email = ?');
                values.push(email);
            }

            values.push(params.id);

            db.run(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to update profile' },
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
                        message: 'Profile updated successfully' 
                    }));
                }
            );
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}