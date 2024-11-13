import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(): Promise<Response> {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                users (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch posts' },
                { status: 500 }
            );
        }

        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: post.users.name,
            author_id: post.author_id,
            created_at: post.created_at
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('Error:', error);
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

        const { data: post, error } = await supabase
            .from('posts')
            .insert([
                { 
                    title, 
                    content, 
                    image, 
                    author_id 
                }
            ])
            .select(`
                *,
                users:author_id (
                    name
                )
            `)
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to create post' },
                { status: 500 }
            );
        }

        // Transform the response
        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: post.users.name,
            created_at: post.created_at,
            author_id: post.author_id
        };

        return NextResponse.json(formattedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const { postIds } = await request.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json(
                { error: 'Post IDs array is required' },
                { status: 400 }
            );
        }

        const { error, count } = await supabase
            .from('posts')
            .delete()
            .in('id', postIds);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to delete posts' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Posts deleted successfully',
            count
        });
    } catch (error) {
        console.error('Error deleting posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}