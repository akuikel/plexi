export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplateService {
  static waitlistWelcome(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Persa!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333;">
          <div style="padding: 40px 30px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <img 
                  src="${process.env.NEXT_PUBLIC_APP_URL || 'https://aipersa.com'}/logo.png" 
                  alt="Persa Logo" 
                  style="width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); object-fit: contain; display: block;"
                />
              </div>
              <h1 style="color: #1f2937; margin: 0; font-size: 32px; font-weight: 700;">Welcome to Persa!</h1>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px; color: #374151; line-height: 1.6;">
              Hi there,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px; color: #374151; line-height: 1.6;">
              Congratulations — you're now part of the Persa community! 🎉
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px; color: #374151; line-height: 1.6;">
              You'll be among the first to hear about updates, new features, and exclusive announcements.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px; color: #374151; line-height: 1.6;">
              Persa is an AI voice assistant platform designed to revolutionize how you interact with technology. We're excited to work on bringing Persa to reality, and we believe it will be a one-of-a-kind experience — especially with you in it.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px; color: #374151; line-height: 1.6;">
              Stay tuned — more exciting things are coming soon!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aipersa.com'}/wait-list/join" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Join Our Waitlist
              </a>
            </div>
            
            <div style="margin: 40px 0;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                With appreciation,<br>The Persa Team
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                You received this email because you signed up for Persa updates. If you didn't, you can safely ignore it.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
                Persa Inc.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Welcome to Persa!

        Hi there,

        Congratulations — you're now part of the Persa community! 🎉

        You'll be among the first to hear about updates, new features, and exclusive announcements.

        Persa is an AI voice assistant platform designed to revolutionize how you interact with technology. We're excited to work on bringing Persa to reality, and we believe it will be a one-of-a-kind experience — especially with you in it.

        Stay tuned — more exciting things are coming soon!

        Join our waitlist: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aipersa.com'}/wait-list/join

        With appreciation,
        The Persa Team

        ---
        You received this email because you signed up for Persa updates. If you didn't, you can safely ignore it.
        Persa Inc.
      `,
    };
  }

  static passwordReset(name: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Reset Your PersaAI Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333;">
          <div style="background: #4f46e5; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">PersaAI</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
              Hello ${name},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
              We received a request to reset your password for your PersaAI account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" 
                 style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin: 24px 0;">
              If you didn't request this password reset, please ignore this email. This link will expire in 1 hour.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;">
            
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #4f46e5; font-weight: 600; margin: 0;">
                Best regards,<br>The PersaAI Team
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Reset Your PersaAI Password

        Hello ${name},

        We received a request to reset your password for your PersaAI account.

        Reset your password: ${resetUrl}

        If you didn't request this password reset, please ignore this email. This link will expire in 1 hour.

        Best regards,
        The PersaAI Team
      `,
    };
  }

  static adminRequest(name: string, adminUrl: string): EmailTemplate {
    return {
      subject: 'Admin Access Request - PersaAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333;">
          <div style="background: #4f46e5; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">PersaAI Admin</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Admin Access Request</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
              Hello ${name},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
              Your admin access request has been approved. Click the button below to access the admin dashboard:
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${adminUrl}" 
                 style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Access Admin Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;">
            
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #4f46e5; font-weight: 600; margin: 0;">
                Best regards,<br>The PersaAI Team
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Admin Access Request - PersaAI

        Hello ${name},

        Your admin access request has been approved.

        Access Admin Dashboard: ${adminUrl}

        Best regards,
        The PersaAI Team
      `,
    };
  }
}
