// netlify/functions/test-glossary.js
var fs = require("fs");
var path = require("path");
try {
  const filePath = path.join(__dirname, "data", "glossary-data.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileContent);
  console.log("JSON parsed successfully");
} catch (error) {
  console.error("Error parsing JSON:", error);
}
//# sourceMappingURL=test-glossary.js.map
