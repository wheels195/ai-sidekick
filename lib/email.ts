import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <no-reply@ai-sidekick.io>',
      to: [email],
      subject: '✅ Let\'s unlock your Sidekick - AI Sidekick',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0b;">
          <!-- Header with dark theme and gradient accent -->
          <div style="background: #0b0b0b; border-bottom: 3px solid; border-image: linear-gradient(to right, #8b5cf6, #60a5fa) 1; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0;">🌱 Welcome to <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>!</h1>
            <p style="color: #34d399; margin: 8px 0 0 0; font-weight: 500;">Your full-time landscaping business partner</p>
          </div>
          
          <!-- Main content with dark background -->
          <div style="padding: 30px 20px; background: #111111; color: #ffffff;">
            <h2 style="color: #34d399; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">✅ Let's unlock your Sidekick</h2>
            <p style="color: #ffffff; line-height: 1.5; margin: 0 0 24px 0; font-size: 16px;">
              One quick step and you'll have instant access to expert insights, local market intelligence, and tactical growth strategies.
            </p>
            
            <!-- Bold CTA Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #34d399; 
                        color: #0b0b0b; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        font-size: 16px;
                        display: inline-block;
                        min-width: 160px;">
                ✅ Verify My Email
              </a>
            </div>
            
            <!-- Backup link with better styling -->
            <div style="background: #1a1a1a; padding: 16px; border-radius: 6px; margin: 24px 0; border-left: 3px solid #34d399;">
              <p style="color: #999999; font-size: 13px; margin: 0 0 8px 0;">Button not working? Copy this link:</p>
              <a href="${verificationUrl}" style="color: #34d399; word-break: break-all; font-size: 13px;">${verificationUrl}</a>
            </div>
            
            <p style="color: #999999; font-size: 13px; margin: 20px 0 0 0;">
              ⏰ This link expires in 24 hours • Didn't sign up? You can safely ignore this email.
            </p>
          </div>
          
          <!-- Dark footer with links -->
          <footer style="background: #0b0b0b; color: #999999; padding: 20px; text-align: center; font-size: 12px;">
            © 2025 <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>. All rights reserved.<br/>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" style="color:#34d399; text-decoration: none;">Terms</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color:#34d399; text-decoration: none;">Privacy</a>
          </footer>
        </div>
      `,
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
      from: 'AI Sidekick <no-reply@ai-sidekick.io>',
      to: [email],
      subject: `🌱 ${businessName}, your Sidekick is ready to work`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0b;">
          <!-- Header with dark theme and gradient accent -->
          <div style="background: #0b0b0b; border-bottom: 3px solid; border-image: linear-gradient(to right, #8b5cf6, #60a5fa) 1; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0;">🌱 Welcome to <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>!</h1>
            <p style="color: #34d399; margin: 8px 0 0 0; font-weight: 500;">Your full-time ${trade} business partner</p>
          </div>
          
          <!-- Main content with dark background -->
          <div style="padding: 30px 20px; background: #111111; color: #ffffff;">
            <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Hi ${firstName}! 👋</h2>
            <p style="color: #ffffff; line-height: 1.5; margin: 0 0 20px 0; font-size: 16px;">
              You're locked and loaded. Your <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span> has instant access to tactical growth strategies:
            </p>
            
            <!-- Feature list with emojis and tighter spacing -->
            <ul style="color: #ffffff; line-height: 1.4; margin: 0 0 24px 0; padding-left: 20px; list-style: none;">
              <li style="margin: 0 0 8px 0;">📈 Pricing & upsell strategies</li>
              <li style="margin: 0 0 8px 0;">📍 Local SEO & Google rankings</li>
              <li style="margin: 0 0 8px 0;">🧠 Smart business suggestions</li>
              <li style="margin: 0 0 8px 0;">📸 AI-powered image ideas</li>
              <li style="margin: 0 0 8px 0;">⭐ Review generation tactics</li>
              <li style="margin: 0 0 8px 0;">🎯 Competitive intelligence</li>
            </ul>
            
            <!-- Magic line -->
            <div style="background: #1a1a1a; padding: 16px; border-radius: 6px; margin: 24px 0; border-left: 3px solid #34d399;">
              <p style="color: #ffffff; margin: 0; line-height: 1.4; font-weight: 500;">
                Your <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span> is ready. Just ask, "How can I double my landscaping leads in [your ZIP]?" — and watch it work.
              </p>
            </div>
            
            <!-- Bold CTA Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/landscaping" 
                 style="background-color: #34d399; 
                        color: #0b0b0b; 
                        padding: 14px 28px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        font-size: 16px;
                        display: inline-block;
                        min-width: 180px;">
                🚀 Start Growing Now
              </a>
            </div>
            
            <p style="color: #999999; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
              Questions? Just reply to this email — we're here to help! 💪
            </p>
          </div>
          
          <!-- Dark footer with links -->
          <footer style="background: #0b0b0b; color: #999999; padding: 20px; text-align: center; font-size: 12px;">
            © 2025 <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>. All rights reserved.<br/>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" style="color:#34d399; text-decoration: none;">Terms</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color:#34d399; text-decoration: none;">Privacy</a><br/>
            <p style="font-size: 12px; color: #999999; margin: 8px 0 0 0;">
              Want fewer emails? <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#34d399; text-decoration: none;">Unsubscribe here</a>.
            </p>
          </footer>
        </div>
      `,
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