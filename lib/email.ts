import { Resend } from 'resend';
import { 
  getVerificationEmailTemplate, 
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate 
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <noreply@ai-sidekick.io>',
      to: [email],
      subject: 'Verify your email - AI Sidekick',
      html: getVerificationEmailTemplate(verificationUrl)
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, firstName: string, businessName: string, trade: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <noreply@ai-sidekick.io>',
      to: [email],
      subject: `Welcome to AI Sidekick, ${firstName}!`,
      html: getWelcomeEmailTemplate(firstName, businessName, trade, email)
    });

    if (error) {
      console.error('Welcome email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <noreply@ai-sidekick.io>',
      to: [email],
      subject: 'Reset your password - AI Sidekick',
      html: getPasswordResetEmailTemplate(resetUrl)
    });

    if (error) {
      console.error('Password reset email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Password reset email failed:', error);
    return { success: false, error };
  }
}