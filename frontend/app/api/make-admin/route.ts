import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db"
import { jwtVerify } from "jose"

function key() {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET missing')
  return new TextEncoder().encode(s)
}

export async function POST(request: NextRequest) {
  try {
    // Get token from session cookie (JWT format) or token cookie (base64 format)
    const sessionToken = request.cookies.get("session")?.value
    const legacyToken = request.cookies.get("token")?.value

    if (!sessionToken && !legacyToken) {
      return NextResponse.json(
        { error: "No authentication token provided. Please log in first." },
        { status: 401 }
      )
    }

    let userId: string
    let userEmail: string
    
    // Try JWT session token first (from login API)
    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken, key())
        userId = payload.sub as string
        userEmail = payload.email as string
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid session token" },
          { status: 401 }
        )
      }
    }
    // Fallback to legacy base64 token
    else if (legacyToken) {
      try {
        const payload = JSON.parse(Buffer.from(legacyToken, 'base64').toString())
        userId = payload.userId
        userEmail = payload.email
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "No valid authentication found" },
        { status: 401 }
      )
    }

    // Get current user
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is already admin
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { success: true, message: "You are already an admin!", user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }},
        { status: 200 }
      )
    }

    // Update user to admin role
    const updatedUser = await (prisma.user.update as any)({
      where: { id: userId },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Successfully promoted to admin!",
      user: updatedUser
    })

  } catch (error) {
    console.error("Make admin error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
