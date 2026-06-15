import fs from "fs";
import path from "path";

// Fix dist/index.html
const indexPath = path.join("dist", "index.html");
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, "utf8");
  content = content.replace(/src="dist\/js\//g, 'src="js/');
  fs.writeFileSync(indexPath, content, "utf8");
  console.log("Fixed paths in dist/index.html");
} else {
  console.error("dist/index.html not found!");
}

// Fix dist/sw.js
const swPath = path.join("dist", "sw.js");
if (fs.existsSync(swPath)) {
  let content = fs.readFileSync(swPath, "utf8");
  content = content.replace(/\.\/dist\/js\//g, "./js/");
  fs.writeFileSync(swPath, content, "utf8");
  console.log("Fixed paths in dist/sw.js");
} else {
  console.error("dist/sw.js not found!");
}
