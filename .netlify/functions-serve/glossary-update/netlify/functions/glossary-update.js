// netlify/functions/glossary-update.js
var fs = require("fs").promises;
var path = require("path");
var AUTH_USER = process.env.GLOSSARY_USER || "admin";
var AUTH_PASS = process.env.GLOSSARY_PASS || "adminpass";
function decodeBasicAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith("Basic ")) return null;
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [user, pass] = credentials.split(":");
  return { user, pass };
}
exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const auth = decodeBasicAuth(event.headers.authorization);
  if (!auth || auth.user !== AUTH_USER || auth.pass !== AUTH_PASS) {
    return { statusCode: 401, body: "Unauthorized" };
  }
  try {
    const newTerm = JSON.parse(event.body);
    if (!newTerm.term || typeof newTerm.term !== "string" || !newTerm.term.trim() || !newTerm.definition || typeof newTerm.definition !== "string" || !newTerm.definition.trim()) {
      return { statusCode: 400, body: "Term and definition are required and must be non-empty strings." };
    }
    const sanitize = (str) => str.replace(/<\/?[^>]+(>|$)/g, "").trim();
    const term = sanitize(newTerm.term);
    const definition = sanitize(newTerm.definition);
    const filePath = path.resolve(__dirname, "glossary-data.json");
    const data = await fs.readFile(filePath, "utf-8");
    const glossary = JSON.parse(data);
    const index = glossary.findIndex((t) => t.term.toLowerCase() === term.toLowerCase());
    if (index > -1) {
      glossary[index].definition = definition;
    } else {
      glossary.push({ term, definition });
    }
    await fs.writeFile(filePath, JSON.stringify(glossary, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Glossary updated successfully." })
    };
  } catch (err) {
    console.error("Glossary update error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to update glossary." }) };
  }
};
//# sourceMappingURL=glossary-update.js.map
