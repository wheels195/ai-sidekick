// Environment variables needed:
// GOOGLE_SHEETS_ID — the spreadsheet ID
// GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
// GOOGLE_PRIVATE_KEY — service account private key (PEM format)
// RESEND_API_KEY — Resend API key
// ADMIN_EMAIL — where to send notifications

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { business_name, website_url, email } = req.body;

    // Validate
    if (!business_name || !website_url || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Normalize URL: strip protocol, www, trailing slash
    const normalized = website_url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .toLowerCase();

    // Get Google Sheets access token
    const accessToken = await getAccessToken();

    // Check for duplicate URL in sheet
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'Sheet1!C:C'; // Column C = normalized URL
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!checkRes.ok) {
      const err = await checkRes.text();
      console.error('Sheets read error:', err);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }

    const checkData = await checkRes.json();
    const existingUrls = (checkData.values || []).flat().map(v => v.toLowerCase());

    if (existingUrls.includes(normalized)) {
      return res.status(409).json({
        error: "We've already built sample ads for this business. If you didn't receive them, check your spam folder or contact us at info@ai-sidekick.io."
      });
    }

    // Append row to sheet
    const now = new Date().toISOString();
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:F:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[business_name, email, normalized, website_url, 'pending', now]]
        })
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      console.error('Sheets append error:', err);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }

    // Send admin notification via Resend
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (resendKey && adminEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AI Sidekick <notifications@ai-sidekick.io>',
          to: adminEmail,
          subject: `New ad request: ${business_name}`,
          html: `<p><strong>Business:</strong> ${escapeHtml(business_name)}</p>
                 <p><strong>Website:</strong> <a href="${escapeHtml(website_url)}">${escapeHtml(website_url)}</a></p>
                 <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                 <p><strong>Submitted:</strong> ${now}</p>`
        })
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('ads-submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Google service account JWT → access token
async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claim = btoa(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));

  const signInput = `${header}.${claim}`;
  const privateKey = await importPrivateKey(key);
  const signature = await sign(privateKey, signInput);
  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
  }

  return tokenData.access_token;
}

async function importPrivateKey(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(key, data) {
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
