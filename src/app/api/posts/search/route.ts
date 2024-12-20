import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([], { status: 200 });
        }

        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                users:author_id (
                    name
                )
            `)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.error('Search error:', error);
            return NextResponse.json(
                { error: 'Failed to search posts' },
                { status: 500 }
            );
        }

        // Transform the response
        const formattedPosts = posts.map((post: { users: { name: string }, [key: string]: any }) => ({
            ...post,
            author: post.users.name,
            users: undefined
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}