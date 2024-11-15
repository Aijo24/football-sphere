import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
): Promise<Response> {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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

        const formattedPosts = posts.map((post: {
            id: string;
            title: string;
            content: string;
            image: string;
            users: { name: string };
            created_at: string;
            author_id: string;
        }) => ({
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