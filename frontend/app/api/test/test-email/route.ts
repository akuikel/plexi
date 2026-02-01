import { NextResponse } from 'next/server';
import { EmailService, emailTransporter } from '@/db/services';

export async function GET() {
  try {
    // First verify email configuration
    const isValid = await emailTransporter.verify();

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email configuration is invalid. Please check your SMTP settings.',
        },
        { status: 500 }
      );
    }

    // Send test email to the configured sender email
    const testEmail = process.env.SMTP_USER || process.env.EMAIL_FROM || 'team@aipersa.com';

    try {
      await EmailService.sendWaitlistWelcome(testEmail, 'Test User');
      return NextResponse.json({
        success: true,
        message: 'Email configuration is working! Test email sent successfully.',
        sentTo: testEmail,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send test email: ${error.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Email test failed: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Send test email to specified address
    try {
      await EmailService.sendWaitlistWelcome(email, 'Test User');
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send test email: ${error.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Email test failed: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
