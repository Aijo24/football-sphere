import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        console.log('Login attempt for:', username);

        try {
            // Query user from Supabase
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('name', username)
                .eq('password', password)
                .single();

            if (error || !user) {
                console.error('Login error:', error);
                return NextResponse.json(
                    { success: false, error: 'Invalid username or password' },
                    { status: 401 }
                );
            }

            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            cookies().set('user', JSON.stringify(userData), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60
            });

            return NextResponse.json({
                success: true,
                user: userData
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { success: false, error: 'Database error' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Login route error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
