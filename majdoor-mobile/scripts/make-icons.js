/* Generates all app icons/splash from the official MAJDOOR logo mark. */
const sharp = require('sharp');
const path = require('path');

const SRC = path.resolve(__dirname, '../../assets');
const OUT = path.resolve(__dirname, '../assets');
const INK = '#0B0D12';
const MARK = path.join(SRC, 'logo-mark-t.png'); // transparent master mark

async function markResized(box) {
  return sharp(MARK).resize(box, box, { fit: 'inside' }).png().toBuffer();
}

async function solidWithMark(size, markRatio, bg, out) {
  const mark = await markResized(Math.round(size * markRatio));
  const meta = await sharp(mark).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile(out);
  console.log('wrote', path.basename(out));
}

async function transparentWithMark(size, markRatio, out) {
  const mark = await markResized(Math.round(size * markRatio));
  const meta = await sharp(mark).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile(out);
  console.log('wrote', path.basename(out));
}

async function whiteSilhouette(size, markRatio, out) {
  // white-on-transparent silhouette for Android notification / monochrome icons
  const box = Math.round(size * markRatio);
  const resized = await sharp(MARK).resize(box, box, { fit: 'inside' }).ensureAlpha().png().toBuffer();
  const meta = await sharp(resized).metadata();
  const alpha = await sharp(resized).extractChannel(3).toBuffer();
  const white = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: '#ffffff' } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: white, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile(out);
  console.log('wrote', path.basename(out));
}

(async () => {
  await solidWithMark(1024, 0.68, INK, path.join(OUT, 'icon.png'));                    // iOS app icon
  await transparentWithMark(1024, 0.58, path.join(OUT, 'android-icon-foreground.png')); // adaptive foreground (safe zone)
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: INK } })
    .png().toFile(path.join(OUT, 'android-icon-background.png'));                       // adaptive background
  await whiteSilhouette(1024, 0.58, path.join(OUT, 'android-icon-monochrome.png'));     // themed icon
  await whiteSilhouette(96, 0.75, path.join(OUT, 'notification-icon.png'));             // notification icon
  await transparentWithMark(512, 0.8, path.join(OUT, 'splash-icon.png'));               // splash mark
  await solidWithMark(48, 0.8, INK, path.join(OUT, 'favicon.png'));
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
