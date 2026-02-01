import { NextResponse } from 'next/server'
import { prisma } from '@/db'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' }, 
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' }, 
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token not expired
        }
      } as any // Temporary type assertion until Prisma types are updated
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' }, 
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      } as any // Temporary type assertion until Prisma types are updated
    })

    return NextResponse.json({ 
      message: 'Password reset successfully' 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' }, 
      { status: 500 }
    )
  }
}
