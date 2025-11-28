const http = require("http");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pump = promisify(pipeline);

const UPLOAD_DIR = path.resolve("./uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const routes = {
  get: {},
  post: {},
  put: {},
  delete: {},
};

function addRoute(method, path, handler) {
  routes[method] = routes[method] || {};
  routes[method][path] = handler;
}

addRoute("get", "/", (req, res) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <h1>Upload page</h1>
    <h3>UPLOAD put</h3>
        <input type="file" name="filetoupload" id="filetoupload">
        <button onclick="uploadFile()">Upload</button>
</body>
<script>
    async function uploadFile() {
        let fileInput = document.getElementById('filetoupload').files[0];
        if (!fileInput) {
            alert("Please select a file to upload");
            return;
        }
        const r = await fetch('/upload', {
            method: 'POST',
            body: fileInput,
            headers: {
                'file-name': fileInput.name || "any",
            }
        })
        alert("File uploaded successfully");
    }
</script>
</html>
  `;
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
});

// example of JSON chunks handling

// addRoute("post", "/json", async (req, res) => {
//   try {
//     const chunks = [];
//     for await (const chunk of req) chunks.push(chunk);
//     const raw = Buffer.concat(chunks).toString("utf8");
//     const data = JSON.parse(raw);
//     const out = JSON.stringify({ received: data, ok: true });
//     res.writeHead(200, { "content-type": "application/json" });
//     res.end(out);
//   } catch (err) {
//     res.writeHead(400, { "content-type": "application/json" });
//     res.end(JSON.stringify(err));
//   }
// });

addRoute("post", "/upload", async (req, res) => {
  console.log(req.headers);
  const filename = req.headers["file-name"];
  if (!filename) {
    return res.end("Filename header missing");
  }
  const out = path.join(UPLOAD_DIR, path.basename(filename));
  const writeStream = fs.createWriteStream(out);
  await pump(req, writeStream);
  res.writeHead(200, { "content-type": "text/plain" });
  res.end(`File ${filename} uploaded successfully`);
});

const myserver = http.createServer(function (req, res) {
  const url = req.url.split("?")[0];
  const method = req.method.toLowerCase();
  handler = routes[method][url];
  if (handler) {
    return handler(req, res);
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

myserver.listen(3000, () => {
  console.log("Server started on port 3000");
});
