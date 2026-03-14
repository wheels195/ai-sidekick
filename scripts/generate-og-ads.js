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

// Render at 2x for crisp text, then downscale
const S = 2;
const W = 1200 * S;
const H = 630 * S;

function roundRect(ctx, x, y, w, h, r) {
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

async function generate() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // === Dark background ===
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  // Ambient glows (scaled)
  const g1 = ctx.createRadialGradient(200*S, 160*S, 0, 200*S, 160*S, 350*S);
  g1.addColorStop(0, 'rgba(232,152,90,0.18)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(500*S, 400*S, 0, 500*S, 400*S, 300*S);
  g2.addColorStop(0, 'rgba(200,120,160,0.10)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  const g3 = ctx.createRadialGradient(1000*S, 200*S, 0, 1000*S, 200*S, 350*S);
  g3.addColorStop(0, 'rgba(90,140,200,0.12)');
  g3.addColorStop(1, 'transparent');
  ctx.fillStyle = g3;
  ctx.fillRect(0, 0, W, H);

  // === White AS logo ===
  try {
    const logo = await loadImage(path.join(__dirname, '..', 'images', 'logo.png'));
    const logoSize = 88;
    const tmpCanvas = createCanvas(logoSize, logoSize);
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(logo, 0, 0, logoSize, logoSize);
    const imgData = tmpCtx.getImageData(0, 0, logoSize, logoSize);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) {
        const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        if (lum < 180) {
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = 255;
        } else {
          d[i + 3] = 0;
        }
      }
    }
    tmpCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tmpCanvas, 72*S, H - 80*S, logoSize, logoSize);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `${15*S}px DMSansBold`;
    ctx.textAlign = 'left';
    ctx.fillText('AI SIDEKICK', 124*S, H - 52*S);
  } catch (e) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `${15*S}px DMSansBold`;
    ctx.fillText('AI SIDEKICK', 72*S, H - 52*S);
  }

  // === Headline ===
  const leftPad = 72 * S;

  ctx.fillStyle = '#ffffff';
  ctx.font = `${72*S}px InstrumentSerif`;
  ctx.textAlign = 'left';
  ctx.fillText('Ads that look as good', leftPad, 230*S);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${72*S}px InstrumentSerifItalic`;
  ctx.fillText('as your business.', leftPad, 315*S);

  // === Subtitle ===
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${20*S}px DMSans`;
  ctx.fillText('AI-generated ad creative for local businesses', leftPad, 375*S);

  // === Ad thumbnails ===
  const adsDir = path.join(__dirname, '..', 'images', 'ads-examples');
  const adFiles = [
    'medspa-facial.jpg',
    'roofing-storm.jpg',
    'dental-whitening.jpg',
    'gym-showup.jpg',
  ];

  const adConfigs = [
    { x: 660, y: 40, w: 220, h: 280, rot: -3 },
    { x: 860, y: 20, w: 220, h: 280, rot: 2 },
    { x: 720, y: 290, w: 220, h: 280, rot: -1.5 },
    { x: 920, y: 270, w: 220, h: 280, rot: 3 },
  ];

  for (let i = 0; i < adFiles.length; i++) {
    try {
      const img = await loadImage(path.join(adsDir, adFiles[i]));
      const cfg = adConfigs[i];
      const x = cfg.x * S, y = cfg.y * S, w = cfg.w * S, h = cfg.h * S;

      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((cfg.rot * Math.PI) / 180);

      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 24 * S;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8 * S;

      roundRect(ctx, -w / 2, -h / 2, w, h, 12 * S);
      ctx.clip();
      ctx.drawImage(img, -w / 2, -h / 2, w, h);

      ctx.restore();
    } catch (e) {
      console.error(`Failed to load ${adFiles[i]}:`, e.message);
    }
  }

  // === URL bottom-right ===
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = `${13*S}px DMSansMedium`;
  ctx.textAlign = 'right';
  ctx.fillText('ai-sidekick.io', W - 48*S, H - 24*S);
  ctx.textAlign = 'left';

  // === Save: render at 2x then downscale to 1200x630 for crisp output ===
  const buffer = canvas.toBuffer('image/png');

  try {
    const sharp = require('sharp');
    const jpgPath = path.join(__dirname, '..', 'images', 'og-image-ads.jpg');
    await sharp(buffer)
      .resize(1200, 630, { kernel: 'lanczos3' })
      .jpeg({ quality: 92 })
      .toFile(jpgPath);
    console.log(`OG image saved to ${jpgPath}`);
  } catch (e) {
    const outPath = path.join(__dirname, '..', 'images', 'og-image-ads.png');
    fs.writeFileSync(outPath, buffer);
    console.log('Sharp not available, saved full-size PNG');
  }
}

generate().catch(console.error);
