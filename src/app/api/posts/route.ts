import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// Définir l'interface correcte pour les données brutes de Supabase
interface SupabasePost {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author_id: string;
    created_at: string;
    users: {
        name: string | null;
    }[];
}

// Définir l'interface pour le format de sortie
interface Post {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author: string;
    created_at: string;
    categories: string[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(): Promise<Response> {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
            throw error;
        }

        if (!posts) {
            return NextResponse.json([]);
        }

        // Convertir les données avec le bon typage
        const formattedPosts: Post[] = (posts as SupabasePost[]).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: post.users[0]?.name || 'Anonymous',
            created_at: post.created_at,
            categories: [], // Ajoutez les catégories si nécessaire
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Error fetching posts' },
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
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Not authenticated' }, 
                { status: 401 }
            );
        }

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
            .eq('author_id', session.user.id);

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