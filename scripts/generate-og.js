const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

// Register fonts
const fontsDir = path.join(__dirname, 'fonts');
GlobalFonts.registerFromPath(path.join(fontsDir, 'InstrumentSerif-Regular.woff2'), 'InstrumentSerif');
GlobalFonts.registerFromPath(path.join(fontsDir, 'InstrumentSerif-Italic.woff2'), 'InstrumentSerifItalic');
GlobalFonts.registerFromPath(path.join(fontsDir, 'DMSans-0.woff2'), 'DMSans');
GlobalFonts.registerFromPath(path.join(fontsDir, 'DMSans-1.woff2'), 'DMSansMedium');
GlobalFonts.registerFromPath(path.join(fontsDir, 'DMSans-2.woff2'), 'DMSansSemiBold');
GlobalFonts.registerFromPath(path.join(fontsDir, 'DMSans-3.woff2'), 'DMSansBold');

const W = 1200;
const H = 630;

const NAVY = '#1a3a5c';
const NAVY_LIGHT = '#2d5f8a';
const BG_DARK = '#141414';
const WHITE = '#ffffff';

async function generate() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // === Background: #141414 like hero ===
  ctx.fillStyle = BG_DARK;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial gradients matching hero::before
  // radial-gradient(ellipse 60% 50% at 70% 20%, rgba(26,58,92,0.15))
  const grad1 = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, 380);
  grad1.addColorStop(0, 'rgba(26,58,92,0.15)');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  // radial-gradient(ellipse 40% 60% at 20% 80%, rgba(26,58,92,0.1))
  const grad2 = ctx.createRadialGradient(W * 0.2, H * 0.8, 0, W * 0.2, H * 0.8, 320);
  grad2.addColorStop(0, 'rgba(26,58,92,0.10)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);

  // === Logo — force pure white using compositing ===
  try {
    const logo = await loadImage(path.join(__dirname, '..', 'images', 'logo.png'));
    const logoSize = 38;
    // Draw logo onto temp canvas, then use it as alpha mask
    const tmpCanvas = createCanvas(logoSize, logoSize);
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(logo, 0, 0, logoSize, logoSize);
    // Get pixel data and force all non-transparent pixels to pure white
    const imgData = tmpCtx.getImageData(0, 0, logoSize, logoSize);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) {
        // Calculate luminance of original pixel to determine if it's the logo (dark) or bg (light)
        const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        if (lum < 180) {
          // Dark pixel (the AS letters) → make white
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
          d[i + 3] = 240;
        } else {
          // Light pixel (background of logo) → make transparent
          d[i + 3] = 0;
        }
      }
    }
    tmpCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tmpCanvas, 72, 52, logoSize, logoSize);

    // "AI SIDEKICK" text next to logo
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '14px DMSansBold';
    ctx.fillText('AI SIDEKICK', 118, 77);
  } catch (e) {
    // Logo load failed, just show text
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '14px DMSansBold';
    ctx.fillText('AI SIDEKICK', 72, 77);
  }

  // === Main headline — matches hero gradient text ===
  const leftPad = 72;
  let y = 210;

  // Hero uses: linear-gradient(180deg, #ffffff 30%, rgba(255,255,255,0.55) 100%)
  // Line 1 is near top → mostly white
  ctx.fillStyle = WHITE;
  ctx.font = '68px InstrumentSerif';
  ctx.fillText('Answer every call.', leftPad, y);

  // Line 2 — slightly faded
  y += 82;
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText('Book every lead.', leftPad, y);

  // Line 3 — italic in the shimmer blue (#7db4e0), matches hero em
  y += 82;
  ctx.fillStyle = '#7db4e0';
  ctx.font = '68px InstrumentSerifItalic';
  ctx.fillText('Grow on autopilot.', leftPad, y);

  // === Subheadline — matches hero-p color rgba(255,255,255,0.65) ===
  y += 50;
  ctx.fillStyle = 'rgba(255,255,255,0.60)';
  ctx.font = '19px DMSans';
  ctx.fillText('AI that answers your phone, texts back missed calls,', leftPad, y);
  y += 28;
  ctx.fillText('books appointments, and follows up with every lead.', leftPad, y);

  // === Right side: workflow cards ===
  const cardX = 700;
  const cardW = 430;
  const cardH = 62;
  const cardGap = 16;
  const cardRadius = 14;
  let cardY = 175;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // --- Card 1: Missed Call ---
  roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Red icon circle
  ctx.beginPath();
  ctx.arc(cardX + 34, cardY + cardH / 2, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239,68,68,0.15)';
  ctx.fill();
  // X mark
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 29, cardY + cardH / 2 - 5);
  ctx.lineTo(cardX + 39, cardY + cardH / 2 + 5);
  ctx.moveTo(cardX + 39, cardY + cardH / 2 - 5);
  ctx.lineTo(cardX + 29, cardY + cardH / 2 + 5);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = '14px DMSansSemiBold';
  ctx.fillText('Missed call from (512) 555-0187', cardX + 60, cardY + 27);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '11.5px DMSans';
  ctx.fillText('Just now', cardX + 60, cardY + 44);

  // Dashed connector
  const lineX = cardX + 34;
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(lineX, cardY + cardH);
  ctx.lineTo(lineX, cardY + cardH + cardGap);
  ctx.stroke();
  ctx.setLineDash([]);

  // --- Card 2: AI Texts Back ---
  cardY += cardH + cardGap;
  const card2H = cardH + 14;
  roundRect(cardX, cardY, cardW, card2H, cardRadius);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Blue icon circle
  ctx.beginPath();
  ctx.arc(cardX + 34, cardY + card2H / 2, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(59,130,246,0.15)';
  ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.font = '12px DMSansBold';
  ctx.textAlign = 'center';
  ctx.fillText('AI', cardX + 34, cardY + card2H / 2 + 4);
  ctx.textAlign = 'left';

  ctx.fillStyle = WHITE;
  ctx.font = '14px DMSansSemiBold';
  ctx.fillText('AI Sidekick texted back', cardX + 60, cardY + 25);
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.font = '12px DMSans';
  ctx.fillText('"Hi! Sorry we missed your call.', cardX + 60, cardY + 43);
  ctx.fillText('How can we help?"', cardX + 60, cardY + 59);

  // Dashed connector
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(lineX, cardY + card2H);
  ctx.lineTo(lineX, cardY + card2H + cardGap);
  ctx.stroke();
  ctx.setLineDash([]);

  // --- Card 3: Appointment Booked ---
  cardY += card2H + cardGap;
  roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,197,94,0.20)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Green icon circle with checkmark
  ctx.beginPath();
  ctx.arc(cardX + 34, cardY + cardH / 2, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34,197,94,0.15)';
  ctx.fill();
  // Checkmark
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cardX + 28, cardY + cardH / 2);
  ctx.lineTo(cardX + 32, cardY + cardH / 2 + 4);
  ctx.lineTo(cardX + 40, cardY + cardH / 2 - 4);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = '14px DMSansSemiBold';
  ctx.fillText('Appointment booked', cardX + 60, cardY + 27);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '11.5px DMSans';
  ctx.fillText('Tomorrow at 9:00 AM', cardX + 60, cardY + 44);

  // Green "Booked" badge
  roundRect(cardX + cardW - 78, cardY + 17, 58, 24, 12);
  ctx.fillStyle = 'rgba(34,197,94,0.12)';
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.font = '10.5px DMSansSemiBold';
  ctx.textAlign = 'center';
  ctx.fillText('Booked', cardX + cardW - 49, cardY + 34);
  ctx.textAlign = 'left';

  // === Bottom accent bar ===
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, NAVY);
  barGrad.addColorStop(0.5, NAVY_LIGHT);
  barGrad.addColorStop(1, NAVY);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, H - 4, W, 4);

  // === URL bottom-right ===
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '13px DMSansMedium';
  ctx.textAlign = 'right';
  ctx.fillText('ai-sidekick.io', W - 72, H - 24);
  ctx.textAlign = 'left';

  // === Save ===
  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'images', 'og-image.png');
  fs.writeFileSync(outPath, buffer);
  console.log(`OG image saved to ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

generate().catch(console.error);
