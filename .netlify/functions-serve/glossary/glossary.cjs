var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/glossary.js
var glossary_exports = {};
__export(glossary_exports, {
  default: () => glossary_default
});
module.exports = __toCommonJS(glossary_exports);
var import_blobs = require("@netlify/blobs");
var SECRET = process.env.ADMIN_SECRET;
var store = (0, import_blobs.getStore)("glossary");
var glossary_default = async (event) => {
  if (event.headers["x-admin-token"] !== SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }
  const send = (code, data) => ({
    statusCode: code,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  switch (event.httpMethod) {
    case "GET": {
      const keys = await store.list();
      const items = await Promise.all(keys.map((k) => store.getJSON(k)));
      return send(200, items);
    }
    case "POST": {
      const { term, definition } = JSON.parse(event.body || "{}");
      if (!term || !definition) return send(400, { error: "Missing fields" });
      await store.setJSON(term.toLowerCase(), { term, definition });
      return send(201, { success: true });
    }
    case "PUT": {
      const { term, definition } = JSON.parse(event.body || "{}");
      if (!term || !definition) return send(400, { error: "Missing fields" });
      await store.setJSON(term.toLowerCase(), { term, definition });
      return send(200, { success: true });
    }
    case "DELETE": {
      const { term } = JSON.parse(event.body || "{}");
      if (!term) return send(400, { error: "Missing term" });
      await store.delete(term.toLowerCase());
      return send(204, {});
    }
    default:
      return { statusCode: 405, body: "Method not allowed" };
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvZ2xvc3NhcnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIG5ldGxpZnkvZnVuY3Rpb25zL2dsb3NzYXJ5LmpzXHJcbmltcG9ydCB7IGdldFN0b3JlIH0gZnJvbSAnQG5ldGxpZnkvYmxvYnMnO1xyXG5cclxuY29uc3QgU0VDUkVUID0gcHJvY2Vzcy5lbnYuQURNSU5fU0VDUkVUOyAgIC8vIHNldCBpbiBOZXRsaWZ5ID4gU2l0ZSA+IEVudlx1MDBBMHZhcnNcclxuY29uc3Qgc3RvcmUgID0gZ2V0U3RvcmUoJ2dsb3NzYXJ5Jyk7ICAgICAgIC8vIG9uZSBzdG9yZSBpcyBwbGVudHlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChldmVudCkgPT4ge1xyXG4gIC8vIC0tLSBydWRpbWVudGFyeSBhdXRoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGlmIChldmVudC5oZWFkZXJzWyd4LWFkbWluLXRva2VuJ10gIT09IFNFQ1JFVCkge1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNDAxLCBib2R5OiAnVW5hdXRob3JpemVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2VuZCA9IChjb2RlLCBkYXRhKSA9PiAoe1xyXG4gICAgc3RhdHVzQ29kZTogY29kZSxcclxuICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSlcclxuICB9KTtcclxuXHJcbiAgc3dpdGNoIChldmVudC5odHRwTWV0aG9kKSB7XHJcbiAgICBjYXNlICdHRVQnOiB7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxpc3QgdGhlIHdob2xlIGdsb3NzYXJ5XHJcbiAgICAgIGNvbnN0IGtleXMgPSBhd2FpdCBzdG9yZS5saXN0KCk7XHJcbiAgICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgUHJvbWlzZS5hbGwoa2V5cy5tYXAoayA9PiBzdG9yZS5nZXRKU09OKGspKSk7XHJcbiAgICAgIHJldHVybiBzZW5kKDIwMCwgaXRlbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhc2UgJ1BPU1QnOiB7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgbmV3IHRlcm1cclxuICAgICAgY29uc3QgeyB0ZXJtLCBkZWZpbml0aW9uIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgJ3t9Jyk7XHJcbiAgICAgIGlmICghdGVybSB8fCAhZGVmaW5pdGlvbikgcmV0dXJuIHNlbmQoNDAwLCB7IGVycm9yOiAnTWlzc2luZyBmaWVsZHMnIH0pO1xyXG5cclxuICAgICAgLy8gXHUyMDFDTGFzdCB3cml0ZSB3aW5zXHUyMDFEIGlzIGZpbmUgZm9yIHR3b1x1MjAxMXBlcnNvbiB1c2FnZVxyXG4gICAgICBhd2FpdCBzdG9yZS5zZXRKU09OKHRlcm0udG9Mb3dlckNhc2UoKSwgeyB0ZXJtLCBkZWZpbml0aW9uIH0pO1xyXG4gICAgICByZXR1cm4gc2VuZCgyMDEsIHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjYXNlICdQVVQnOiB7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBhbiBleGlzdGluZyB0ZXJtXHJcbiAgICAgIGNvbnN0IHsgdGVybSwgZGVmaW5pdGlvbiB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5IHx8ICd7fScpO1xyXG4gICAgICBpZiAoIXRlcm0gfHwgIWRlZmluaXRpb24pIHJldHVybiBzZW5kKDQwMCwgeyBlcnJvcjogJ01pc3NpbmcgZmllbGRzJyB9KTtcclxuXHJcbiAgICAgIGF3YWl0IHN0b3JlLnNldEpTT04odGVybS50b0xvd2VyQ2FzZSgpLCB7IHRlcm0sIGRlZmluaXRpb24gfSk7XHJcbiAgICAgIHJldHVybiBzZW5kKDIwMCwgeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNhc2UgJ0RFTEVURSc6IHsgICAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIGEgdGVybVxyXG4gICAgICBjb25zdCB7IHRlcm0gfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCAne30nKTtcclxuICAgICAgaWYgKCF0ZXJtKSByZXR1cm4gc2VuZCg0MDAsIHsgZXJyb3I6ICdNaXNzaW5nIHRlcm0nIH0pO1xyXG5cclxuICAgICAgYXdhaXQgc3RvcmUuZGVsZXRlKHRlcm0udG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgIHJldHVybiBzZW5kKDIwNCwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDQwNSwgYm9keTogJ01ldGhvZCBub3QgYWxsb3dlZCcgfTtcclxuICB9XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0EsbUJBQXlCO0FBRXpCLElBQU0sU0FBUyxRQUFRLElBQUk7QUFDM0IsSUFBTSxZQUFTLHVCQUFTLFVBQVU7QUFFbEMsSUFBTyxtQkFBUSxPQUFPLFVBQVU7QUFFOUIsTUFBSSxNQUFNLFFBQVEsZUFBZSxNQUFNLFFBQVE7QUFDN0MsV0FBTyxFQUFFLFlBQVksS0FBSyxNQUFNLGVBQWU7QUFBQSxFQUNqRDtBQUVBLFFBQU0sT0FBTyxDQUFDLE1BQU0sVUFBVTtBQUFBLElBQzVCLFlBQVk7QUFBQSxJQUNaLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDOUMsTUFBTSxLQUFLLFVBQVUsSUFBSTtBQUFBLEVBQzNCO0FBRUEsVUFBUSxNQUFNLFlBQVk7QUFBQSxJQUN4QixLQUFLLE9BQU87QUFDVixZQUFNLE9BQU8sTUFBTSxNQUFNLEtBQUs7QUFDOUIsWUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEtBQUssSUFBSSxPQUFLLE1BQU0sUUFBUSxDQUFDLENBQUMsQ0FBQztBQUMvRCxhQUFPLEtBQUssS0FBSyxLQUFLO0FBQUEsSUFDeEI7QUFBQSxJQUVBLEtBQUssUUFBUTtBQUNYLFlBQU0sRUFBRSxNQUFNLFdBQVcsSUFBSSxLQUFLLE1BQU0sTUFBTSxRQUFRLElBQUk7QUFDMUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFZLFFBQU8sS0FBSyxLQUFLLEVBQUUsT0FBTyxpQkFBaUIsQ0FBQztBQUd0RSxZQUFNLE1BQU0sUUFBUSxLQUFLLFlBQVksR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzVELGFBQU8sS0FBSyxLQUFLLEVBQUUsU0FBUyxLQUFLLENBQUM7QUFBQSxJQUNwQztBQUFBLElBRUEsS0FBSyxPQUFPO0FBQ1YsWUFBTSxFQUFFLE1BQU0sV0FBVyxJQUFJLEtBQUssTUFBTSxNQUFNLFFBQVEsSUFBSTtBQUMxRCxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVksUUFBTyxLQUFLLEtBQUssRUFBRSxPQUFPLGlCQUFpQixDQUFDO0FBRXRFLFlBQU0sTUFBTSxRQUFRLEtBQUssWUFBWSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDNUQsYUFBTyxLQUFLLEtBQUssRUFBRSxTQUFTLEtBQUssQ0FBQztBQUFBLElBQ3BDO0FBQUEsSUFFQSxLQUFLLFVBQVU7QUFDYixZQUFNLEVBQUUsS0FBSyxJQUFJLEtBQUssTUFBTSxNQUFNLFFBQVEsSUFBSTtBQUM5QyxVQUFJLENBQUMsS0FBTSxRQUFPLEtBQUssS0FBSyxFQUFFLE9BQU8sZUFBZSxDQUFDO0FBRXJELFlBQU0sTUFBTSxPQUFPLEtBQUssWUFBWSxDQUFDO0FBQ3JDLGFBQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztBQUFBLElBQ3JCO0FBQUEsSUFFQTtBQUNFLGFBQU8sRUFBRSxZQUFZLEtBQUssTUFBTSxxQkFBcUI7QUFBQSxFQUN6RDtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
