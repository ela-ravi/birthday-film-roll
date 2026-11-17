// Builds film-roll-maker.html: the point-and-click maker as ONE file (templates inlined).
// Run after editing anything in src/:  npm run build:ui
const fs = require("fs");
const inline = f => JSON.stringify(fs.readFileSync(`src/${f}`, "utf8")).replace(/</g, "\\u003c");
const html = fs.readFileSync("src/builder.html", "utf8")
  .replace("__SLIDESHOW__", () => inline("slideshow.html"))
  .replace("__GATE__", () => inline("gate.html"));
fs.writeFileSync("film-roll-maker.html", html);
console.log(`Wrote film-roll-maker.html (${(html.length / 1024).toFixed(0)} KB)`);
