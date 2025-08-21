import { Resend } from 'resend';
import { render } from '@react-email/render';
import { 
  getVerificationEmailTemplate, 
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate 
} from './email-templates';
import WelcomeEmail from '../emails/welcome';
import TrialDay1Email from '../emails/trial-day-1';
import TrialDay2Email from '../emails/trial-day-2';
import TrialDay3Email from '../emails/trial-day-3';
import TrialDay4Email from '../emails/trial-day-4';
import TrialDay5Email from '../emails/trial-day-5';
import TrialDay6Email from '../emails/trial-day-6';
import TrialDay7Email from '../emails/trial-day-7';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sending configuration
interface TrialEmailConfig {
  email: string;
  firstName: string;
  businessName?: string;
  trade?: string;
}

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <support@ai-sidekick.io>',
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
    // Use React Email component with dark theme
    const emailHtml = render(WelcomeEmail({ 
      firstName, 
      businessName, 
      trade,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <support@ai-sidekick.io>',
      to: [email],
      subject: `Welcome to AI Sidekick, ${firstName}!`,
      html: emailHtml
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
      from: 'AI Sidekick <support@ai-sidekick.io>',
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

// Trial Day Email Functions with Full Personalization
export async function sendTrialDay1Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay1Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'Mike Wheeler, AI Sidekick <support@ai-sidekick.io>',
      to: [email],
      subject: `${firstName}, here's your first win with AI Sidekick`,
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 1 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 1 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay2Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay2Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick Team <support@ai-sidekick.io>',
      to: [email],
      subject: 'Landscapers are using AI Sidekick to win more jobs',
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 2 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 2 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay3Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay3Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick Team <support@ai-sidekick.io>',
      to: [email],
      subject: 'Want more leads? Start with better ads.',
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 3 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 3 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay4Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay4Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick Team <support@ai-sidekick.io>',
      to: [email],
      subject: 'Don\'t guess. Ask AI Sidekick.',
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 4 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 4 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay5Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay5Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick Team <support@ai-sidekick.io>',
      to: [email],
      subject: 'Your trial ends in 2 days — don\'t lose momentum',
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 5 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 5 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay6Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay6Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick Team <support@ai-sidekick.io>',
      to: [email],
      subject: 'How do you stack up against competitors?',
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 6 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 6 email failed:', error);
    return { success: false, error };
  }
}

export async function sendTrialDay7Email(email: string, firstName: string) {
  try {
    const emailHtml = render(TrialDay7Email({ 
      firstName,
      userEmail: email
    }));

    const { data, error } = await resend.emails.send({
      from: 'Mike Wheeler, AI Sidekick <support@ai-sidekick.io>',
      to: [email],
      subject: `${firstName}, your trial ends today — here\'s my ask`,
      html: emailHtml
    });

    if (error) {
      console.error('Trial Day 7 email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Trial Day 7 email failed:', error);
    return { success: false, error };
  }
}