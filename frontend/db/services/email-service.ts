import { emailTransporter } from './email-transporter';
import { EmailTemplateService, EmailTemplate } from './email-templates';

export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  static async sendWaitlistWelcome(to: string, name: string): Promise<EmailServiceResult> {
    try {
      const template = EmailTemplateService.waitlistWelcome(name);
      const result = await emailTransporter.sendMail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Waitlist welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Error sending waitlist welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<EmailServiceResult> {
    try {
      const template = EmailTemplateService.passwordReset(name, resetUrl);
      const result = await emailTransporter.sendMail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendAdminRequest(to: string, name: string, adminUrl: string): Promise<EmailServiceResult> {
    try {
      const template = EmailTemplateService.adminRequest(name, adminUrl);
      const result = await emailTransporter.sendMail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Admin request email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Error sending admin request email:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendCustomEmail(to: string, template: EmailTemplate, from?: string): Promise<EmailServiceResult> {
    try {
      const result = await emailTransporter.sendMail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        from,
      });

      console.log('Custom email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Error sending custom email:', error);
      return { success: false, error: error.message };
    }
  }

  static async verifyConfiguration(): Promise<boolean> {
    return await emailTransporter.verify();
  }

  static async testEmail(to: string): Promise<EmailServiceResult> {
    try {
      const template = EmailTemplateService.waitlistWelcome('Test User');
      return await this.sendCustomEmail(to, template);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Export individual services for specific use cases
export { EmailTemplateService, emailTransporter };
