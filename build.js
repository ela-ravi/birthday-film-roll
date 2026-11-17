// Builds dist/<name>_Birthday_Protected.html from ./photos, config.json and captions.json.
// Usage: npm run build          (asks for a password)
//        PASSWORD='secret' npm run build
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");

let sharp;
try { sharp = require("sharp"); } catch { console.error("Run `npm install` first."); process.exit(1); }

const read = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);
const config = { name: "Friend", photoSeconds: 2.5, maxPixels: 1280, jpegQuality: 70, ...read("config.json", {}) };
const captions = read("captions.json", {});
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fill = (tpl, vars) => tpl.replace(/__([A-Z]+)__/g, (m, k) => (k in vars ? vars[k] : m)); // function form: no `$` surprises

function askPassword() {
  return new Promise(resolve => {
    if (!process.stdin.isTTY) return resolve("");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = s => { if (s.includes("Password")) process.stdout.write(s); }; // hide typing
    rl.question("Password (leave empty to generate one): ", a => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

(async () => {
  const files = fs.readdirSync("photos")
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  if (!files.length) { console.error("No photos found. Put .jpg/.png/.webp files in the photos/ folder."); process.exit(1); }

  let password = process.env.PASSWORD || (await askPassword());
  let generated = false;
  if (!password) { password = crypto.randomBytes(8).toString("hex").slice(0, 10); generated = true; }

  console.log(`Processing ${files.length} photos...`);
  const photos = [];
  for (const f of files) {
    const buf = await sharp(path.join("photos", f))
      .rotate() // respect phone orientation
      .resize(config.maxPixels, config.maxPixels, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: config.jpegQuality })
      .toBuffer();
    photos.push({ src: "data:image/jpeg;base64," + buf.toString("base64"), caption: captions[f] || "" });
  }
  const unused = Object.keys(captions).filter(k => !files.includes(k));
  if (unused.length) console.warn("Captions with no matching photo:", unused.join(", "));

  const title = `Happy Birthday ${config.name}`;
  const slideshow = fill(fs.readFileSync("src/slideshow.html", "utf8"), {
    TITLE: esc(title),
    DURATION: String(Math.round(config.photoSeconds * 1000)),
    PHOTOS: JSON.stringify(photos).replace(/</g, "\\u003c"),
  });

  const ITER = 600000;
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITER, 32, "sha256");
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(slideshow, "utf8"), c.final(), c.getAuthTag()]); // WebCrypto wants the tag appended

  const page = fill(fs.readFileSync("src/gate.html", "utf8"), {
    TITLE: esc(title), NAME: esc(config.name), SALT: salt.toString("base64"), IV: iv.toString("base64"),
    ITER: String(ITER), DATA: enc.toString("base64"),
  });

  fs.mkdirSync("dist", { recursive: true });
  const out = path.join("dist", `${config.name.replace(/[^\w-]+/g, "_")}_Birthday_Protected.html`);
  fs.writeFileSync(out, page);
  console.log(`\nDone: ${out} (${(page.length / 1e6).toFixed(1)} MB)`);
  if (generated) console.log(`Generated password: ${password}   <- save it, it is not stored anywhere`);
})();
