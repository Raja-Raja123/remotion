require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const { sendVideoToLaravel } = require("./services/sendVideoToLaravel");

const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());

// ✅ FIX 1: Body parser added
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- ENSURE FOLDERS EXIST ---------------- */

const videosDir = path.join(__dirname, "videos");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ---------------- SERVE STATIC FILES ---------------- */

app.use("/uploads", express.static(uploadsDir));
app.use("/videos", express.static(videosDir));

/* ---------------- MULTER SETUP ---------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // ✅ FIX 2: safe path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName =
      Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage });

/* ---------------- CLOUDINARY CONFIG ---------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- VIDEO DURATIONS ---------------- */

const durationMap = {
  6: 180,
  10: 300,
  14: 420,
  18: 540,
};

/* ---------------- REMOTION BUNDLE ---------------- */

let bundleLocation;

const prepareBundle = async () => {
  bundleLocation = await bundle("./src/index.jsx");
  console.log("Remotion bundle ready");
};

// ✅ FIX 3: error handling
prepareBundle().catch((err) => {
  console.error("Bundle failed:", err);
});

/* ---------------- VIDEO RENDER FUNCTION ---------------- */

async function renderAd(themeId, data) {
  const durationFrames = durationMap[data.duration] || 300;
  const images = (data.images || []).slice(0, 6);

  const inputProps = {
    ...data,
    images,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: themeId,
    inputProps,
  });

  const outputFile = path.join(videosDir, `ad-${Date.now()}.mp4`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: durationFrames,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputFile,
    inputProps,
    concurrency: 2, // ✅ FIX 4: reduced for Render
  });

  return outputFile;
}

/* ---------------- CLOUDINARY UPLOAD ---------------- */

async function uploadVideo(filePath, categoryID, token, description) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "generated_ads",
    });

    console.log("Uploaded to Cloudinary:", result.secure_url);

    const videoUrl = result.secure_url;
    await sendVideoToLaravel(videoUrl, categoryID, token, description);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
  }
}

/* ---------------- GENERIC RENDER HANDLER ---------------- */

async function handleRender(req, res, theme) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    const body = req.body;
    const description = body.description;
    const categoryID = body.category_id;

    // ✅ FIX 5: dynamic base URL for production
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${PORT}`;

    const images =
  req.files?.images?.map(
    (file) => path.join(uploadsDir, file.filename)
  ) || [];

    const audio = req.files?.audio?.[0]
  ? path.join(uploadsDir, req.files.audio[0].filename)
  : null;

    const video = req.files?.video?.[0]
  ? path.join(uploadsDir, req.files.video[0].filename)
  : null;

    const data = {
      ...body,
      images,
      audio,
      video,
      duration: Number(body.duration),
    };

    const videoPath = await renderAd(theme, data);

    const tempVideoUrl = `${baseUrl}/${videoPath}`;

    res.json({
      success: true,
      video: tempVideoUrl,
    });

    // background upload
    uploadVideo(videoPath, categoryID, token, description);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/* ---------------- TEMP FILE CLEANUP ---------------- */

const TEMP_FILE_MAX_AGE = 20 * 60 * 1000;

setInterval(() => {
  cleanupOldFiles(videosDir);
  cleanupOldFiles(uploadsDir);
}, 10 * 60 * 1000);

const cleanupOldFiles = (directory) => {
  try {
    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      const age = Date.now() - stats.mtimeMs;

      if (age > TEMP_FILE_MAX_AGE) {
        fs.unlinkSync(filePath);
        console.log(`Deleted temp file: ${file}`);
      }
    });
  } catch (err) {
    console.error("Cleanup error:", err);
  }
};

/* ---------------- ROUTES ---------------- */

const mediaUpload = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

app.post("/render/modern", mediaUpload, (req, res) => {
  handleRender(req, res, "ThemeModern");
});

app.post("/render/dynamic", mediaUpload, (req, res) => {
  handleRender(req, res, "ThemeDynamic");
});

app.post("/render/retro", mediaUpload, (req, res) => {
  handleRender(req, res, "ThemeRetro");
});

app.post("/render/cinematic", mediaUpload, (req, res) => {
  handleRender(req, res, "ThemeCinematic");
});

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("hello admin ! greeting from remotion renderer server");
});

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Remotion render server running on port ${PORT}`);
});