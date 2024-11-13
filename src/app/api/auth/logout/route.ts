import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    // Remove the user cookie
    cookies().delete('user');

    return NextResponse.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
}