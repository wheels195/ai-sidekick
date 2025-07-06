import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <onboarding@resend.dev>', // Will change to noreply@ai-sidekick.io once domain is set up
      to: [email],
      subject: 'Verify your email address - AI Sidekick',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #0891b2); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AI Sidekick!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your specialized landscaping business assistant</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify your email address</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Thanks for signing up! Please click the button below to verify your email address and start getting expert landscaping business advice.
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
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2025 AI Sidekick. All rights reserved.
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
      from: 'AI Sidekick <onboarding@resend.dev>', // Will change to welcome@ai-sidekick.io once domain is set up
      to: [email],
      subject: `Welcome to AI Sidekick, ${businessName}! 🌱`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #0891b2); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AI Sidekick!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your ${trade} business growth partner</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${businessName}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              You're all set up! Your AI Sidekick is ready to help you grow your ${trade} business with expert advice on:
            </p>
            
            <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
              <li>🚀 Local SEO strategies</li>
              <li>💰 Pricing and upselling opportunities</li>
              <li>📝 Content creation for your website and social media</li>
              <li>⭐ Getting more 5-star reviews</li>
              <li>📈 Seasonal business planning</li>
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
                Start Chatting Now
              </a>
            </div>
            
            <div style="background: #e5f3ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">💡 Pro Tip:</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                Start with specific questions like "How can I rank higher for landscaping in [your city]?" or "What should I charge for spring cleanup in my area?" The more context you provide, the better advice you'll get!
              </p>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              Questions? Just reply to this email - we're here to help!
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