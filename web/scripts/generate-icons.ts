import sharp from "sharp";
import path from "path";
import fs from "fs";

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT = path.join(process.cwd(), "public", "images", "logo.png");
const ICONS_DIR = path.join(process.cwd(), "public", "icons");

// Neumorphic light background colour — matches --neu-bg
const BG = { r: 232, g: 237, b: 242, alpha: 1 };

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`❌ Source image not found: ${INPUT}`);
    console.error("   Copy your logo PNG to web/public/images/logo.png first.");
    process.exit(1);
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true });

  for (const size of SIZES) {
    const out = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(INPUT)
      .resize(size, size, { fit: "contain", background: BG })
      .png()
      .toFile(out);
    console.log(`✅ ${size}×${size} → ${path.relative(process.cwd(), out)}`);
  }

  // favicon.png at 32×32
  const favicon = path.join(process.cwd(), "public", "favicon.png");
  await sharp(INPUT)
    .resize(32, 32, { fit: "contain", background: BG })
    .png()
    .toFile(favicon);
  console.log(`✅ 32×32  → public/favicon.png`);

  // White-on-transparent logo for dark mode navbar
  const logoWideSrc = path.join(process.cwd(), "public", "images", "logo-wide.png");
  const logoWideWhite = path.join(process.cwd(), "public", "images", "logo-wide-white.png");
  if (fs.existsSync(logoWideSrc)) {
    const { data: rawData, info } = await sharp(logoWideSrc)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4]     = 255;               // R — white
      rgba[i * 4 + 1] = 255;               // G — white
      rgba[i * 4 + 2] = 255;               // B — white
      rgba[i * 4 + 3] = 255 - rawData[i];  // A — opaque where logo is dark
    }
    await sharp(rgba, { raw: { width, height, channels: 4 } })
      .png()
      .toFile(logoWideWhite);
    console.log(`✅ dark logo → public/images/logo-wide-white.png`);
  }

  console.log("\n🎉 All icons generated!");
}

main().catch((err) => { console.error(err); process.exit(1); });
