import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Define the Post type
interface Post {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author_id: string;
    created_at: string;
    users?: {
        name: string | null;
    };
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(): Promise<Response> {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                id,
                title,
                content,
                image,
                created_at,
                author_id,
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

        const formattedPosts = (posts as Post[]).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: post.users?.name || 'Unknown',
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

export async function POST(req: Request) {
    try {
        // Créer le client Supabase
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.log('No session found');
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Récupérer les données du post
        const { title, content, image, categories } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Créer le post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert([
                {
                    title,
                    content,
                    image: image || null,
                    categories: categories || [],
                    author_id: session.user.id
                }
            ])
            .select()
            .single();

        if (postError) {
            console.error('Post creation error:', postError);
            return NextResponse.json(
                { error: 'Failed to create post' },
                { status: 500 }
            );
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the session from cookie
        const cookieStore = cookies();
        const token = cookieStore.get('sb-access-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' }, 
                { status: 401 }
            );
        }

        // Set the auth token
        supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
        });

        const { postIds } = await request.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json(
                { error: 'Post IDs array is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .in('id', postIds)
            .eq('author_id', session.user.id); // Only delete user's own posts

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to delete posts' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Posts deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}