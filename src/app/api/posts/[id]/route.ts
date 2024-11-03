import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';
import { unlink } from 'fs/promises';

const db = new sqlite3.Database(
    path.join(process.cwd(), 'data', 'database.sqlite'),
    sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            console.error('Could not connect to database', err);
        } else {
            console.log('Connected to database');
        }
    }
);

// GET single post
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('GET /api/posts/:id called', params.id);

    return new Promise((resolve) => {
        const query = `
            SELECT 
                posts.id,
                posts.title,
                posts.content,
                posts.image,
                posts.created_at,
                users.name as author,
                users.id as author_id
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE posts.id = ?
        `;

        db.get(query, [params.id], (err, post) => {
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

            console.log('Post fetched:', post.id);
            resolve(NextResponse.json(post));
        });
    });
}

// PUT update post
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('PUT /api/posts/:id called', params.id);

    try {
        const body = await request.json();
        const { content, author_id } = body;

        if (!content || !author_id) {
            return NextResponse.json(
                { error: 'Content and author_id are required' },
                { status: 400 }
            );
        }

        return new Promise((resolve) => {
            // First verify the author owns this post
            db.get(
                'SELECT author_id FROM posts WHERE id = ?',
                [params.id],
                (err, post) => {
                    if (err) {
                        resolve(NextResponse.json(
                            { error: 'Failed to verify post ownership' },
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

                    if (post.author_id !== parseInt(author_id)) {
                        resolve(NextResponse.json(
                            { error: 'Unauthorized' },
                            { status: 403 }
                        ));
                        return;
                    }

                    // Update the post
                    db.run(
                        `UPDATE posts 
                        SET content = ?, 
                            updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?`,
                        [content, params.id],
                        function(err) {
                            if (err) {
                                resolve(NextResponse.json(
                                    { error: 'Failed to update post' },
                                    { status: 500 }
                                ));
                                return;
                            }

                            resolve(NextResponse.json({
                                success: true,
                                message: 'Post updated successfully'
                            }));
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}

// DELETE post
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('DELETE /api/posts/:id called', params.id);

    try {
        const body = await request.json();
        const { user_id, role } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return new Promise((resolve) => {
            // Check post ownership and user role
            db.get(
                'SELECT author_id FROM posts WHERE id = ?',
                [params.id],
                async (err, post) => {
                    if (err) {
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

                    // Allow deletion if user is:
                    // 1. The post creator OR
                    // 2. An admin OR
                    // 3. A moderator
                    const canDelete = 
                        post.author_id === parseInt(user_id) || 
                        role === 'ADMIN' || 
                        role === 'MODERATOR';

                    if (!canDelete) {
                        resolve(NextResponse.json(
                            { error: 'Unauthorized' },
                            { status: 403 }
                        ));
                        return;
                    }

                    // Get post image before deletion
                    db.get(
                        'SELECT image FROM posts WHERE id = ?',
                        [params.id],
                        async (err, postWithImage) => {
                            if (err) {
                                resolve(NextResponse.json(
                                    { error: 'Failed to fetch post image' },
                                    { status: 500 }
                                ));
                                return;
                            }

                            // Delete the image file if it exists
                            if (postWithImage?.image) {
                                try {
                                    const imagePath = path.join(
                                        process.cwd(),
                                        'public',
                                        postWithImage.image
                                    );
                                    await unlink(imagePath);
                                    console.log('Image deleted:', postWithImage.image);
                                } catch (error) {
                                    console.error('Error deleting image:', error);
                                    // Continue with post deletion even if image deletion fails
                                }
                            }

                            // Delete the post
                            db.run(
                                'DELETE FROM posts WHERE id = ?',
                                [params.id],
                                function(err) {
                                    if (err) {
                                        resolve(NextResponse.json(
                                            { error: 'Failed to delete post' },
                                            { status: 500 }
                                        ));
                                        return;
                                    }

                                    console.log('Post deleted:', params.id);
                                    resolve(NextResponse.json({
                                        success: true,
                                        message: 'Post deleted successfully'
                                    }));
                                }
                            );
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}