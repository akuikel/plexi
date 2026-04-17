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
    // Get token from session cookie
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Please log in to check request status" },
        { status: 401 }
      )
    }

    let userId: string
    
    try {
      const { payload } = await jwtVerify(sessionToken, key())
      userId = payload.sub as string
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 401 }
      )
    }

    // Get user's admin requests
    const adminRequests = await prisma.adminRequest.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5 // Last 5 requests
    })

    // Get current user to check if they're already admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    const response = {
      isAdmin: user?.role === "ADMIN",
      requests: adminRequests.map(req => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt,
        processedAt: req.approvedAt, // Using approvedAt as processedAt
        expiresAt: req.expiresAt
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Check pending error:", error)
    return NextResponse.json(
      { error: "Failed to check request status" },
      { status: 500 }
    )
  }
}
