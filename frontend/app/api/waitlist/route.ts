// app/api/waitlist/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { EmailService } from '@/db/services';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        email: true,
        role: true,
      },
    });

    if (existing) {
      if (existing.role === 'WAITLIST') {
        return NextResponse.json(
          {
            error: "You are already on our waiting list! We'll notify you when we launch.",
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            error: 'An account with this email already exists. Please try logging in.',
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(email, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: email.toLowerCase(),
        name: name?.trim() || email.toLowerCase(),
        passwordHash,
        role: 'WAITLIST',
      } as any,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Send welcome email
    try {
      await EmailService.sendWaitlistWelcome(email.toLowerCase(), name?.trim() || email.toLowerCase());
      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waiting list!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        joinedAt: user.createdAt,
      },
    });
  } catch (e: any) {
    console.error('WAITLIST ERROR:', e);

    // Handle Prisma errors
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Email already exists in our system',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          error: `Database error (${e.code})`,
        },
        { status: 500 }
      );
    }

    // General error handling
    const msg = process.env.NODE_ENV === 'development' ? e?.message || 'Server error' : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
