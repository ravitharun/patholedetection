// server.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3001;

// ensure uploads folder exists
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

app.use(express.json());

// POST /api/upload - receives "photo" (FormData)
app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "Missing file" });

  // incoming GPS metadata optional
  const { lat, lng, accuracy, ts } = req.body;

  // construct public URL where this file can be downloaded from the server
  const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;

  // example server-side logging / processing
  console.log("Uploaded:", req.file.path, { lat, lng, accuracy, ts });

  return res.json({
    ok: true,
    file: req.file.filename,
    fileUrl,
    metadata: { lat, lng, accuracy, ts }
  });
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Serve the already-uploaded assignment PDF (user-provided file)
// Local path: /mnt/data/Team 13- Assignment 3.pdf
// We'll expose it under a stable public route for quick testing.
const uploadedPdfLocalPath = "/mnt/data/Team 13- Assignment 3.pdf";
if (fs.existsSync(uploadedPdfLocalPath)) {
  // copy to uploads folder with safe name so it can be served by the same static middleware
  const destName = "Team-13-Assignment-3.pdf";
  const destPath = path.join(UPLOAD_DIR, destName);
  try {
    if (!fs.existsSync(destPath)) fs.copyFileSync(uploadedPdfLocalPath, destPath);
    console.log("Exposing uploaded PDF at /uploads/" + destName);
  } catch (err) {
    console.warn("Could not copy uploaded PDF:", err.message);
  }
}

// health check
app.get("/api/ping", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Upload server listening on http://localhost:${PORT}`);
  console.log(`POST files to http://localhost:${PORT}/api/upload (field name: "photo")`);
});
