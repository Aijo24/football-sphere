import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// Initialize database with verbose mode for better error logging
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

// GET all posts
export async function GET() {
    console.log('GET /api/posts called');

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
            ORDER BY posts.created_at DESC
        `;

        db.all(query, [], (err, posts) => {
            if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json(
                    { error: 'Failed to fetch posts' },
                    { status: 500 }
                ));
                return;
            }

            console.log(`Fetched ${posts?.length} posts`);
            resolve(NextResponse.json(posts || []));
        });
    });
}

// POST new post
export async function POST(request: Request) {
    console.log('POST /api/posts called');

    try {
        const formData = await request.formData();
        
        // Log received data
        console.log('Received form data:', {
            title: formData.get('title'),
            content: formData.get('content'),
            author_id: formData.get('author_id'),
            hasImage: formData.has('image')
        });

        const title = formData.get('title')?.toString();
        const content = formData.get('content')?.toString();
        const author_id = formData.get('author_id')?.toString();
        const imageFile = formData.get('image');

        // Validate required fields
        if (!title || !content || !author_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let imageUrl = '';

        // Handle image upload if present
        if (imageFile && imageFile instanceof File) {
            try {
                // Validate file type
                if (!imageFile.type.startsWith('image/')) {
                    return NextResponse.json(
                        { error: 'Invalid file type. Only images are allowed.' },
                        { status: 400 }
                    );
                }

                // Create uploads directory
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                await mkdir(uploadsDir, { recursive: true });

                // Create safe filename
                const timestamp = Date.now();
                const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '');
                const filename = `${timestamp}-${safeFilename}`;
                
                // Save file
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const filepath = path.join(uploadsDir, filename);
                await writeFile(filepath, buffer);
                
                imageUrl = `/uploads/${filename}`;
                console.log('Image saved:', imageUrl);
            } catch (error) {
                console.error('Error saving image:', error);
                return NextResponse.json(
                    { error: 'Failed to save image' },
                    { status: 500 }
                );
            }
        }

        // Insert into database
        return new Promise((resolve) => {
            const query = `
                INSERT INTO posts (title, content, image, author_id, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;

            db.run(
                query,
                [title, content, imageUrl, author_id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        resolve(NextResponse.json(
                            { error: 'Failed to create post' },
                            { status: 500 }
                        ));
                        return;
                    }

                    console.log('Post created:', this.lastID);
                    resolve(NextResponse.json({
                        success: true,
                        message: 'Post created successfully',
                        id: this.lastID,
                        imageUrl
                    }, { status: 201 }));
                }
            );
        });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}