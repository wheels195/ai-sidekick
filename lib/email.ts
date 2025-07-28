import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <no-reply@ai-sidekick.io>',
      to: [email],
      subject: '⚡ Let\'s unlock your Sidekick - AI Sidekick',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - AI Sidekick</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #000000 0%, #030712 25%, #0f0f23 50%, #030712 75%, #000000 100%);
              margin: 0;
              padding: 20px;
              color: #e5e7eb;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #000000 0%, #030712 25%, #0f0f23 50%, #030712 75%, #000000 100%);
              border-radius: 24px;
              border: 1px solid rgba(52, 211, 153, 0.3);
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #14b8a6 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
              pointer-events: none;
            }
            
            .logo-text {
              font-family: 'Dancing Script', cursive;
              color: #000000;
              font-size: 36px;
              font-weight: 700;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
              background: rgba(0, 0, 0, 0.4);
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #ffffff;
              margin-bottom: 20px;
            }
            
            .message {
              font-size: 16px;
              color: #e5e7eb;
              margin-bottom: 25px;
              line-height: 1.7;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #14b8a6 100%);
              color: #000000;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              padding: 16px 32px;
              border-radius: 16px;
              margin: 20px 0;
              box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.2);
              transition: all 0.3s ease;
            }
            
            .backup-link {
              background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
              border: 1px solid rgba(52, 211, 153, 0.2);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
            }
            
            .footer {
              padding: 30px;
              text-align: center;
              background: linear-gradient(135deg, #000000 0%, #030712 100%);
              border-top: 1px solid rgba(52, 211, 153, 0.2);
            }
            
            .footer p {
              color: #9ca3af;
              font-size: 14px;
              margin: 5px 0;
              line-height: 1.5;
            }
            
            .footer a {
              color: #34d399;
              text-decoration: none;
              transition: color 0.3s ease;
            }
            
            .footer a:hover {
              color: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 class="logo-text">AI Sidekick</h1>
            </div>
            
            <div class="content">
              <div class="greeting">Let's unlock your Sidekick</div>
              <div class="message">
                One quick step and you'll have instant access to expert insights, local market intelligence, and tactical growth strategies for your business.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="cta-button">
                  Verify My Email
                </a>
              </div>
              
              <div class="backup-link">
                <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">Button not working? Copy this link:</p>
                <a href="${verificationUrl}" style="color: #34d399; word-break: break-all; font-size: 13px;">${verificationUrl}</a>
              </div>
              
              <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0;">
                This link expires in 24 hours. Didn't sign up? You can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>. All rights reserved.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms">Terms</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy">Privacy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
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
      subject: `⚡ ${businessName}, your Sidekick is ready to work`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AI Sidekick</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #000000 0%, #030712 25%, #0f0f23 50%, #030712 75%, #000000 100%);
              margin: 0;
              padding: 20px;
              color: #e5e7eb;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #000000 0%, #030712 25%, #0f0f23 50%, #030712 75%, #000000 100%);
              border-radius: 24px;
              border: 1px solid rgba(52, 211, 153, 0.3);
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #14b8a6 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
              pointer-events: none;
            }
            
            .logo-text {
              font-family: 'Dancing Script', cursive;
              color: #000000;
              font-size: 36px;
              font-weight: 700;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
              background: rgba(0, 0, 0, 0.4);
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #ffffff;
              margin-bottom: 20px;
            }
            
            .message {
              font-size: 16px;
              color: #e5e7eb;
              margin-bottom: 25px;
              line-height: 1.7;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #14b8a6 100%);
              color: #000000;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              padding: 16px 32px;
              border-radius: 16px;
              margin: 20px 0;
              box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.2);
              transition: all 0.3s ease;
            }
            
            .features {
              background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
              border: 1px solid rgba(52, 211, 153, 0.2);
              border-radius: 16px;
              padding: 25px;
              margin: 25px 0;
            }
            
            .features h3 {
              color: #34d399;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
            }
            
            .features ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .features li {
              color: #e5e7eb;
              padding: 8px 0;
              border-bottom: 1px solid rgba(52, 211, 153, 0.1);
            }
            
            .features li:last-child {
              border-bottom: none;
            }
            
            .features li:before {
              content: "✓";
              color: #34d399;
              font-weight: bold;
              margin-right: 10px;
            }
            
            .highlight-box {
              background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
              border: 1px solid rgba(52, 211, 153, 0.2);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
            }
            
            .footer {
              padding: 30px;
              text-align: center;
              background: linear-gradient(135deg, #000000 0%, #030712 100%);
              border-top: 1px solid rgba(52, 211, 153, 0.2);
            }
            
            .footer p {
              color: #9ca3af;
              font-size: 14px;
              margin: 5px 0;
              line-height: 1.5;
            }
            
            .footer a {
              color: #34d399;
              text-decoration: none;
              transition: color 0.3s ease;
            }
            
            .footer a:hover {
              color: #10b981;
            }
            
            .unsubscribe-link {
              color: #6b7280;
              text-decoration: underline;
              font-size: 12px;
              margin-top: 15px;
              display: inline-block;
              transition: color 0.3s ease;
            }
            
            .unsubscribe-link:hover {
              color: #34d399;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 class="logo-text">AI Sidekick</h1>
            </div>
            
            <div class="content">
              <div class="greeting">Hi ${firstName}! Welcome aboard</div>
              <div class="message">
                You're locked and loaded. Your <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span> has instant access to tactical growth strategies for ${businessName}.
              </div>
              
              <div class="features">
                <h3>Your arsenal includes:</h3>
                <ul>
                  <li>Pricing & upsell strategies</li>
                  <li>Local SEO & Google rankings</li>
                  <li>Smart business suggestions</li>
                  <li>AI-powered image generation</li>
                  <li>Review generation tactics</li>
                  <li>Competitive intelligence</li>
                </ul>
              </div>
              
              <div class="highlight-box">
                <p style="color: #ffffff; margin: 0; line-height: 1.5; font-weight: 500;">
                  Your <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span> is ready. Just ask, "How can I double my ${trade} leads in [your ZIP]?" — and watch it work.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/landscaping" class="cta-button">
                  Start Growing Now
                </a>
              </div>
              
              <div style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
                Questions? Just reply to this email — we're here to help!
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 <span style="font-family: 'Dancing Script', cursive; color: #34d399;">AI Sidekick</span>. All rights reserved.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms">Terms</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy">Privacy</a>
              </p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" class="unsubscribe-link">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
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