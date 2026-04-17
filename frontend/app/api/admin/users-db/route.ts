import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db"
import { jwtVerify } from "jose"

function key() {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET missing')
  return new TextEncoder().encode(s)
}

export async function GET(request: NextRequest) {
  try {
    // Get token from session cookie (JWT format) or token cookie (base64 format)
    const sessionToken = request.cookies.get("session")?.value
    const legacyToken = request.cookies.get("token")?.value

    if (!sessionToken && !legacyToken) {
      return NextResponse.json(
        { error: "No authentication token provided. Please log in." },
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
        console.error("JWT verification failed:", error)
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
        { error: "No valid authentication token found" },
        { status: 401 }
      )
    }

    // Get user from database to check current role
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has admin role OR email contains "admin" 
    const isAdmin = user.role === "ADMIN" || user.email.toLowerCase().includes("admin")
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access forbidden. Admin privileges required." },
        { status: 403 }
      )
    }

    // Fetch all users from database
    const users = await (prisma.user.findMany as any)({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success: true,
      users: users
    })

  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
