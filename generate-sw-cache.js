import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const dir = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(dir, "dist");
const swPath = join(distDir, "sw.js");

function getFiles(dir, base = "") {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getFiles(full, rel));
    } else {
      files.push("./" + rel);
    }
  }
  return files;
}

const precacheFiles = getFiles(distDir).filter(
  (f) =>
    f !== "./sw.js" &&
    !f.endsWith(".map") &&
    !f.startsWith("./node_modules"),
);

const sw = readFileSync(swPath, "utf-8");

if (!sw.includes("/*PRECACHE*/")) {
  console.error("ERROR: sw.js missing /*PRECACHE*/ marker");
  process.exit(1);
}

const newSw = sw.replace(
  "/*PRECACHE*/",
  JSON.stringify(precacheFiles, null, 2),
);

writeFileSync(swPath, newSw);
console.log(`Generated SW precache with ${precacheFiles.length} files`);
