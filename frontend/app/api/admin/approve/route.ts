import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
      return new NextResponse(
        `<html><body><h2>❌ Invalid Request</h2><p>Missing token or action parameter</p></body></html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Find admin request by token
    const adminRequest = await prisma.adminRequest.findUnique({
      where: { authToken: token },
    });

    if (!adminRequest) {
      return new NextResponse(
        `<html><body><h2>❌ Invalid Token</h2><p>Authorization token not found or expired</p></body></html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Get user details separately
    const user = await prisma.user.findUnique({
      where: { id: adminRequest.userId },
    });

    if (!user) {
      return new NextResponse(`<html><body><h2>❌ User Not Found</h2><p>Associated user not found</p></body></html>`, {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token is expired
    if (new Date() > adminRequest.expiresAt) {
      await prisma.adminRequest.update({
        where: { id: adminRequest.id },
        data: { status: 'EXPIRED' },
      });

      return new NextResponse(
        `<html><body><h2>⏰ Request Expired</h2><p>This authorization link has expired</p></body></html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Check if already processed
    if (adminRequest.status !== 'PENDING') {
      return new NextResponse(
        `<html><body><h2>ℹ️ Already Processed</h2><p>This request has already been ${adminRequest.status.toLowerCase()}</p></body></html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    let message = '';
    let statusColor = '';

    if (action === 'approve') {
      // Update user role to ADMIN
      await prisma.user.update({
        where: { id: adminRequest.userId },
        data: { role: 'ADMIN' },
      });

      // Update request status
      await prisma.adminRequest.update({
        where: { id: adminRequest.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      message = '✅ Admin access approved! User has been granted admin privileges.';
      statusColor = '#22c55e';

      // Send approval email to user
      await sendUserNotification(adminRequest.userEmail, true, adminRequest.userName);
    } else if (action === 'reject') {
      // Update request status
      await prisma.adminRequest.update({
        where: { id: adminRequest.id },
        data: {
          status: 'REJECTED',
          approvedAt: new Date(),
        },
      });

      message = '❌ Admin request rejected. User has been notified.';
      statusColor = '#ef4444';

      // Send rejection email to user
      await sendUserNotification(adminRequest.userEmail, false, adminRequest.userName);
    } else {
      return new NextResponse(
        `<html><body><h2>❌ Invalid Action</h2><p>Action must be 'approve' or 'reject'</p></body></html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Return success page
    return new NextResponse(
      `
      <html>
        <head>
          <title>Admin Request Processed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; }
            .message { color: ${statusColor}; font-size: 18px; font-weight: bold; }
            .details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>🎉 Request Processed Successfully</h2>
            <p class="message">${message}</p>
            
            <div class="details">
              <h3>Request Details:</h3>
              <p><strong>User:</strong> ${adminRequest.userName} (${adminRequest.userEmail})</p>
              <p><strong>Action:</strong> ${action.toUpperCase()}</p>
              <p><strong>Processed:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>The user has been automatically notified via email about this decision.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Admin approval error:', error);
    return new NextResponse(
      `<html><body><h2>❌ Server Error</h2><p>Failed to process admin request</p></body></html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

async function sendUserNotification(userEmail: string, approved: boolean, userName: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const subject = approved ? '🎉 Admin Access Approved!' : '📝 Admin Request Update';

    const html = approved
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">🎉 Congratulations!</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <p>Hi ${userName},</p>
          <p><strong>Great news! Your admin access request has been approved.</strong></p>
          <p>You now have administrator privileges and can access the admin dashboard.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin" 
             style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🚀 ACCESS ADMIN DASHBOARD
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Welcome to the admin team! Use your new privileges responsibly.
        </p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">📝 Admin Request Update</h2>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p>Hi ${userName},</p>
          <p>Thank you for your interest in admin access. After review, your request was not approved at this time.</p>
          <p>If you believe this was an error or have additional information, please contact the administrator directly.</p>
        </div>

        <p style="color: #666; font-size: 14px;">
          You can continue using the application with your current access level.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Failed to send user notification:', error);
  }
}
