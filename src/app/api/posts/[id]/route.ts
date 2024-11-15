import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const postId = params.id;
        console.log('Fetching post:', postId);

        const { data: post, error } = await supabase
            .from('posts')
            .select(`
                *,
                users (
                    name
                )
            `)
            .eq('id', postId)
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: post.users.name,
            author_id: post.author_id,
            created_at: post.created_at,
            categories: post.categories || []
        };

        return NextResponse.json(formattedPost);
    } catch (error) {
        console.error('Error:', error);
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
        const body = await request.json();
        const { user_id, role } = body;

        // Check if user has permission to delete
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (post.author_id !== user_id && role !== 'ADMIN' && role !== 'MODERATOR') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to delete post' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Post deleted successfully' 
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
        const { content, author_id } = await request.json();

        // Check if user owns the post
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (post.author_id !== author_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from('posts')
            .update({ content })
            .eq('id', postId);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to update post' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Post updated successfully' 
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}