import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const userCookie = cookies().get('user');
    
    if (userCookie) {
        try {
            const userData = JSON.parse(userCookie.value);
            return NextResponse.json(userData);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }
    }
    
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
} 