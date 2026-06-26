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

  console.log("\n🎉 All icons generated!");
}

main().catch((err) => { console.error(err); process.exit(1); });
