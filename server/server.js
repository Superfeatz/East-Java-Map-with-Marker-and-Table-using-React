import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();

// CORS configuration - izinkan dari localhost:3000
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

const uploadDir = path.resolve("./uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ];
    if (!allowed.includes(file.mimetype) && 
        !file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      return cb(new Error("Format file tidak didukung (harus .xlsx, .xls, atau .csv)"));
    }
    cb(null, true);
  },
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }
  res.json({
    message: `File ${req.file.originalname} berhasil disimpan sebagai ${req.file.filename}`,
    filename: req.file.filename,
    path: req.file.path
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server berjalan dengan baik" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📂 File upload disimpan di: ${uploadDir}`);
});