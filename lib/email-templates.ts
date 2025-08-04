// Professional email templates that work across all email clients
// Following email HTML best practices with inline styles and table-based layouts

export const getEmailStyles = () => `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #000000;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #000000;
    padding: 40px 0;
  }
  
  .main {
    background-color: #0a0a0a;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
    border: 1px solid #1a1a1a;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .header {
    background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
    padding: 40px 30px;
    text-align: center;
  }
  
  .logo {
    font-size: 48px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    font-family: 'Brush Script MT', 'Lucida Handwriting', 'Apple Chancery', cursive;
    font-style: italic;
    letter-spacing: -2px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    transform: rotate(-2deg);
    display: inline-block;
  }
  
  .tagline {
    color: #d1fae5;
    font-size: 14px;
    margin-top: 8px;
  }
  
  .content {
    padding: 40px 30px;
    background-color: #0a0a0a;
  }
  
  .greeting {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
  }
  
  .message {
    font-size: 16px;
    color: #d1d5db;
    margin-bottom: 25px;
    line-height: 1.7;
  }
  
  .button-container {
    text-align: center;
    margin: 35px 0;
  }
  
  .button {
    display: inline-block;
    padding: 16px 40px;
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
  }
  
  .feature-box {
    background-color: #111111;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 25px;
    margin: 30px 0;
  }
  
  .feature-title {
    color: #10b981;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
  }
  
  .feature-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  .feature-item {
    color: #d1d5db;
    padding: 8px 0;
    padding-left: 25px;
    position: relative;
  }
  
  .checkmark {
    color: #10b981;
    position: absolute;
    left: 0;
    font-weight: bold;
  }
  
  .divider {
    height: 1px;
    background-color: #1f2937;
    margin: 30px 0;
  }
  
  .footer {
    background-color: #050505;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #1f2937;
  }
  
  .footer-text {
    color: #6b7280;
    font-size: 14px;
    margin: 5px 0;
  }
  
  .footer-links {
    margin: 15px 0;
  }
  
  .footer-link {
    color: #10b981 !important;
    text-decoration: none;
    margin: 0 10px;
    font-size: 14px;
  }
  
  .unsubscribe {
    color: #4b5563 !important;
    font-size: 12px;
    margin-top: 20px;
  }
  
  @media only screen and (max-width: 600px) {
    .main {
      border-radius: 0;
    }
    
    .content {
      padding: 30px 20px;
    }
    
    .greeting {
      font-size: 20px;
    }
    
    .button {
      padding: 14px 30px;
      font-size: 15px;
    }
  }
`;

export const getVerificationEmailTemplate = (verificationUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - AI Sidekick</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>${getEmailStyles()}</style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td>
          <!-- Header -->
          <table class="header" role="presentation">
            <tr>
              <td>
                <h1 class="logo">AI Sidekick</h1>
                <p class="tagline">Specialized AI for Local Trades</p>
              </td>
            </tr>
          </table>
          
          <!-- Content -->
          <table class="content" role="presentation">
            <tr>
              <td>
                <h2 class="greeting">Let's unlock your Sidekick 🚀</h2>
                <p class="message">
                  One quick step and you'll have instant access to expert insights, local market intelligence, 
                  and tactical growth strategies for your landscaping business.
                </p>
                
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">Verify My Email</a>
                </div>
                
                <div class="feature-box">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">
                    <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                  </p>
                  <p style="color: #10b981; font-size: 12px; word-break: break-all; margin-top: 10px;">
                    ${verificationUrl}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
                  This link expires in 24 hours. Didn't sign up? You can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer -->
          <table class="footer" role="presentation">
            <tr>
              <td>
                <p class="footer-text">© 2025 AI Sidekick. All rights reserved.</p>
                <div class="footer-links">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" class="footer-link">Terms</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" class="footer-link">Privacy</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/learn" class="footer-link">Learn</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const getWelcomeEmailTemplate = (
  firstName: string,
  businessName: string,
  trade: string,
  email: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Sidekick</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>${getEmailStyles()}</style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td>
          <!-- Header -->
          <table class="header" role="presentation">
            <tr>
              <td>
                <h1 class="logo">AI Sidekick</h1>
                <p class="tagline">Your Business Growth Partner</p>
              </td>
            </tr>
          </table>
          
          <!-- Content -->
          <table class="content" role="presentation">
            <tr>
              <td>
                <h2 class="greeting">Welcome aboard, ${firstName}! 🎉</h2>
                <p class="message">
                  Your AI Sidekick is ready to help <strong style="color: #10b981;">${businessName}</strong> 
                  dominate the local ${trade} market. Let's get you growing!
                </p>
                
                <div class="feature-box">
                  <h3 class="feature-title">🚀 Your Growth Arsenal Includes:</h3>
                  <ul class="feature-list">
                    <li class="feature-item">
                      <span class="checkmark">✓</span> Smart pricing & upsell strategies
                    </li>
                    <li class="feature-item">
                      <span class="checkmark">✓</span> Local SEO & Google ranking tactics
                    </li>
                    <li class="feature-item">
                      <span class="checkmark">✓</span> Customer acquisition playbooks
                    </li>
                    <li class="feature-item">
                      <span class="checkmark">✓</span> AI-powered marketing content
                    </li>
                    <li class="feature-item">
                      <span class="checkmark">✓</span> Competitive intelligence reports
                    </li>
                    <li class="feature-item">
                      <span class="checkmark">✓</span> 24/7 business strategy support
                    </li>
                  </ul>
                </div>
                
                <div class="button-container">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/landscaping" class="button">
                    Start Growing Now →
                  </a>
                </div>
                
                <div style="background-color: #064e3b; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                  <p style="color: #d1fae5; font-size: 16px; margin: 0; font-weight: 500;">
                    💡 <strong>Pro Tip:</strong> Start by asking<br/>
                    <em>"How can I get 10 more ${trade} clients this month?"</em>
                  </p>
                </div>
                
                <div class="divider"></div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                  <strong>Need help?</strong> Just reply to this email — we're here to support your success!
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer -->
          <table class="footer" role="presentation">
            <tr>
              <td>
                <p class="footer-text">© 2025 AI Sidekick. All rights reserved.</p>
                <div class="footer-links">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" class="footer-link">Terms</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" class="footer-link">Privacy</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/learn" class="footer-link">Learn</a>
                </div>
                <p class="unsubscribe">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" 
                     style="color: #4b5563 !important;">
                    Unsubscribe from emails
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const getPasswordResetEmailTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - AI Sidekick</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>${getEmailStyles()}</style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td>
          <!-- Header -->
          <table class="header" role="presentation">
            <tr>
              <td>
                <h1 class="logo">AI Sidekick</h1>
                <p class="tagline">Password Reset Request</p>
              </td>
            </tr>
          </table>
          
          <!-- Content -->
          <table class="content" role="presentation">
            <tr>
              <td>
                <h2 class="greeting">Reset Your Password 🔐</h2>
                <p class="message">
                  We received a request to reset your password. Click the button below to create a new password.
                </p>
                
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <div class="feature-box">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">
                    <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                  </p>
                  <p style="color: #10b981; font-size: 12px; word-break: break-all; margin-top: 10px;">
                    ${resetUrl}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
                  <strong>Didn't request this?</strong> You can safely ignore this email. 
                  Your password won't be changed unless you click the link above.
                </p>
                
                <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 15px;">
                  This link expires in 1 hour for security reasons.
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer -->
          <table class="footer" role="presentation">
            <tr>
              <td>
                <p class="footer-text">© 2025 AI Sidekick. All rights reserved.</p>
                <div class="footer-links">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" class="footer-link">Terms</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" class="footer-link">Privacy</a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/learn" class="footer-link">Learn</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;