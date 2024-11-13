import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
): Promise<Response> {
    try {
        console.log('Fetching posts for user ID:', params.userId);

        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                users:author_id (
                    name
                )
            `)
            .eq('author_id', params.userId)
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
            created_at: post.created_at,
            author_id: post.author_id
        }));

        console.log('Found posts:', formattedPosts);

        return NextResponse.json(formattedPosts);

    } catch (error) {
        console.error('Error fetching user posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}