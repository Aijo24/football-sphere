import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, password } = body;

        console.log('Signup attempt for:', name);

        try {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('name', name)
                .single();

            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Username already exists' },
                    { status: 400 }
                );
            }

            // Insert new user
            const { data: newUser, error } = await supabase
                .from('users')
                .insert([
                    { 
                        name, 
                        password,
                        role: 'user'
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Signup error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to create user' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    role: newUser.role
                }
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { success: false, error: 'Database error' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Signup route error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}