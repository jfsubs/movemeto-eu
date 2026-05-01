import sharp from "sharp";

const dir = "./public/images/hero";
const files = ["hero-01.webp","hero-02.webp","hero-03.webp","hero-04.webp"];

for (const file of files) {
  const src = `${dir}/${file}`;
  const out = `${dir}/new_${file}`;
  await sharp(src)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(out);
  console.log(`done: ${file}`);
}
