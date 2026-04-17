import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailTransporter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || 'team@aipersa.com',
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '',
      },
    };

    return nodemailer.createTransport(config);
  }

  async sendMail(options: { to: string; subject: string; html: string; text: string; from?: string }) {
    const fromEmail =
      options.from ||
      `"${process.env.FROM_NAME || 'Persa Team'}" <${process.env.FROM_EMAIL || 'team@aipersa.com'}>`;

    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return false;
    }
  }

  getTransporter(): nodemailer.Transporter {
    return this.transporter;
  }
}

// Singleton instance
export const emailTransporter = new EmailTransporter();
