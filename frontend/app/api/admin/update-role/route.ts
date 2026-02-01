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
        { error: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Decode token to get user info
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

    // Get the request body
    const { targetUserId, newRole } = await request.json()

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Missing required fields: targetUserId and newRole" },
        { status: 400 }
      )
    }

    if (!["USER", "ADMIN"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 }
      )
    }

    // Get current user to verify admin access
    const currentUser = await (prisma.user.findUnique as any)({
      where: { id: userId }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      )
    }

    // Check if current user has admin privileges
    const isAdmin = currentUser.role === "ADMIN" || currentUser.email.toLowerCase().includes("admin")
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access forbidden. Admin privileges required." },
        { status: 403 }
      )
    }

    // Update the target user's role
    const updatedUser = await (prisma.user.update as any)({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: updatedUser
    })

  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
