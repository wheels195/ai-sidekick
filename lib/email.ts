import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <no-reply@ai-sidekick.io>',
      to: [email],
      subject: 'Verify your email address - AI Sidekick',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #0891b2); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to <span style="font-family: 'Dancing Script', cursive;">AI Sidekick</span>!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your specialized landscaping business assistant</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify your email address</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Thanks for signing up! Please click the button below to verify your email and unlock expert tools to grow your landscaping business.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #10b981, #0891b2); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                ✅ Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This link expires in 24 hours.<br>
              Didn't sign up? You can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2025 <span style="font-family: 'Dancing Script', cursive;">AI Sidekick</span>. All rights reserved.
            </p>
          </div>
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

export async function sendWelcomeEmail(email: string, businessName: string, trade: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <no-reply@ai-sidekick.io>',
      to: [email],
      subject: `Welcome to AI Sidekick, ${businessName}! 🌱`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #0891b2); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to <span style="font-family: 'Dancing Script', cursive;">AI Sidekick</span>!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your ${trade} business growth partner</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${businessName}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              You're all set up — your <span style="font-family: 'Dancing Script', cursive;">AI Sidekick</span> is ready to help you grow with expert insights and time-saving tools, including:
            </p>
            
            <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
              <li>🚀 Local SEO & Google ranking strategies</li>
              <li>💰 Pricing and upselling recommendations</li>
              <li>📝 Website and social media content creation</li>
              <li>⭐ Getting more 5-star reviews</li>
              <li>📈 Seasonal planning for consistent revenue</li>
              <li>📊 Competitive insights and local market analysis</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/landscaping" 
                 style="background: linear-gradient(135deg, #10b981, #0891b2); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                ✅ Start Chatting Now
              </a>
            </div>
            
            <div style="background: #e5f3ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">💡 Pro Tip:</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6; font-style: italic;">
                Ask: "What are 3 things I should fix right now to get more landscaping leads in [your city]?"<br>
                The more local detail you give, the better your Sidekick can guide you.
              </p>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
              Have questions? Just reply to this email — we're here to help!
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2025 <span style="font-family: 'Dancing Script', cursive;">AI Sidekick</span>. All rights reserved.
            </p>
          </div>
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