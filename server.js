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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- PATHS ---------------- */

const videosDir = path.join(__dirname, "videos");
const uploadsDir = path.join(__dirname, "uploads");

/* ---------------- SAFE DIR ---------------- */

const ensureDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
};

/* ---------------- INIT DIR ---------------- */

ensureDir(videosDir);
ensureDir(uploadsDir);

/* ---------------- STATIC ---------------- */

app.use("/uploads", express.static(uploadsDir));
app.use("/videos", express.static(videosDir));

/* ---------------- MULTER ---------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(uploadsDir); // 🔥 critical
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name =
      Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, name + ext);
  },
});

const upload = multer({ storage });

/* ---------------- CLOUDINARY ---------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- DURATION ---------------- */

const durationMap = {
  6: 180,
  10: 300,
  14: 420,
  18: 540,
};

/* ---------------- REMOTION ---------------- */

let bundleLocation;

const prepareBundle = async () => {
  bundleLocation = await bundle("./src/index.jsx");
  console.log("✅ Remotion bundle ready");
};

/* ---------------- RENDER ---------------- */

async function renderAd(themeId, data) {
  const durationFrames = durationMap[data.duration] || 300;

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: themeId,
    inputProps: data,
  });

  ensureDir(videosDir);

  const outputFile = path.join(videosDir, `ad-${Date.now()}.mp4`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: durationFrames,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputFile,
    inputProps: data,
     concurrency: 1,
  puppeteerOptions: {
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  },
  });

  return outputFile;
}

/* ---------------- UPLOAD ---------------- */

async function uploadVideo(filePath, categoryID, token, description) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "generated_ads",
    });

    await sendVideoToLaravel(
      result.secure_url,
      categoryID,
      token,
      description
    );

    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary error:", err);
  }
}

/* ---------------- HANDLER ---------------- */

async function handleRender(req, res, theme) {
  try {
    // 🔥 ensure dirs
    ensureDir(uploadsDir);
    ensureDir(videosDir);

    // 🔥 IMPORTANT SAFETY
    if (!bundleLocation) {
      return res.status(500).json({
        success: false,
        error: "Server not ready yet, try again in few seconds",
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    const body = req.body;

    const baseUrl =
      process.env.BASE_URL || `http://localhost:${PORT}`;

   const images =
  req.files?.images?.map(
    (file) => `${baseUrl}/uploads/${file.filename}`
  ) || [];

const audio = req.files?.audio?.[0]
  ? `${baseUrl}/uploads/${req.files.audio[0].filename}`
  : null;

const video = req.files?.video?.[0]
  ? `${baseUrl}/uploads/${req.files.video[0].filename}`
  : null;

    console.log("Images:", images);

    const data = {
      ...body,
      images,
      audio,
      video,
      duration: Number(body.duration),
    };

    console.log("🔥 Rendering...");

    const videoPath = await renderAd(theme, data);

    console.log("✅ Render done");

    const tempVideoUrl = `${baseUrl}/videos/${path.basename(videoPath)}`;

    res.json({
      success: true,
      video: tempVideoUrl,
    });

    uploadVideo(videoPath, body.category_id, token, body.description);

  } catch (err) {
    console.error("🔥 ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ---------------- CLEANUP ---------------- */

const TEMP_FILE_MAX_AGE = 20 * 60 * 1000;

setInterval(() => {
  cleanupOldFiles(videosDir);
  cleanupOldFiles(uploadsDir);
}, 10 * 60 * 1000);

const cleanupOldFiles = (dir) => {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const file of files) {
    try {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (Date.now() - stats.mtimeMs > TEMP_FILE_MAX_AGE) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  }
};

/* ---------------- ROUTES ---------------- */

const mediaUpload = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

app.post("/render/modern", mediaUpload, (req, res) =>
  handleRender(req, res, "ThemeModern")
);
app.post("/render/dynamic", mediaUpload, (req, res) =>
  handleRender(req, res, "ThemeDynamic")
);
app.post("/render/retro", mediaUpload, (req, res) =>
  handleRender(req, res, "ThemeRetro")
);
app.post("/render/cinematic", mediaUpload, (req, res) =>
  handleRender(req, res, "ThemeCinematic")
);

app.get("/", (req, res) => {
  res.send("Remotion server running");
});

/* ---------------- START (CRITICAL FIX) ---------------- */

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await prepareBundle(); // 🔥 WAIT HERE

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
};

startServer();