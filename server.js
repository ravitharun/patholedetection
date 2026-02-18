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
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Missing file" });
  }

  // incoming GPS metadata optional
  const { lat, lng, accuracy, ts } = req.body;

  // construct public URL
  const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;

  console.log("Uploaded:", req.file.path, { lat, lng, accuracy, ts });

  return res.json({
    ok: true,
    file: req.file.filename,
    fileUrl,
    metadata: { lat, lng, accuracy, ts },
  });
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Serve the already-uploaded assignment PDF (optional)
const uploadedPdfLocalPath = "/mnt/data/Team 13- Assignment 3.pdf";
if (fs.existsSync(uploadedPdfLocalPath)) {
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
app.get("/api/ping", (req, res) => {
  res.json({ ok: true });
});

// ROOT ROUTE (ADDED — no structure change)
app.get("/", (req, res) => {
  res.send("Backend running. Use /api/upload or /api/ping");
});

app.listen(PORT, () => {
  console.log(`Upload server listening on http://localhost:${PORT}`);
  console.log(
    `POST files to http://localhost:${PORT}/api/upload (field name: "photo")`
  );
});
