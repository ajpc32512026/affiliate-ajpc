// netlify/functions/glossary-get.js
var fs = require("fs");
var path = require("path");
exports.handler = async () => {
  try {
    const filePath = path.resolve(__dirname, "data", "glossary-data.json");
    const content = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(content);
    return {
      statusCode: 200,
      body: JSON.stringify(json)
    };
  } catch (error) {
    console.error("\u274C Error loading glossary:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Glossary load failed: " + error.message })
    };
  }
};
//# sourceMappingURL=glossary-get.js.map
