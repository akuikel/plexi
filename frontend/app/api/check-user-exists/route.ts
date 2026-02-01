import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/db/services/user.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists using UserService
    const user = await UserService.verifyUserExists(userId);

    if (!user) {
      return NextResponse.json({ exists: false, user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          profileUrl: user.profileUrl || '',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check user exists error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
