import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import shoplistingsRoutes from "./routes/shoplistings.js";
import eventRoutes from "./routes/event.js";
import articleRoutes from "./routes/articles.js";
import reviewRoutes from "./routes/review.js";
import feedbackRoutes from "./routes/feedbacks.js";
import meetupRoutes from "./routes/meetup.js";
import friendRequestRoutes from "./routes/friendRequest.js";
import galleryRoutes from "./routes/gallery.js";
import searchRoutes from "./routes/search.js";
import favoritesRoutes from "./routes/favorites.js";
import myrewardsRoutes from "./routes/myrewards.js";
import adminRoutes from "./routes/admin.js";
import shopreviewRoutes from "./routes/shopreview.js";
import ownerRoutes from "./routes/shopowner.js";
import landingRoutes from "./routes/landing.js";
import testRoutes from "./routes/test.js";

// to be deleted
import advertiseRoute from "./routes/advertise.js";

//middlewares
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// upload files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.post("/upload-multiple", upload.array("files", 10), (req, res) => {
  const files = req.files; // Access the array of uploaded files
  const fileNames = files.map(file => `${Date.now()}-${file.originalname}`);

  files.forEach((file, index) => {
    const newPath = `../client/public/upload/${fileNames[index]}`;
    fs.renameSync(file.path, newPath);
  });

  res.status(200).json(fileNames); // Send back the filenames
});

app.post("/upload-documents", upload.array('files', 10), (req, res) => {
  const files = req.files; // Access the array of uploaded files
  const fileNames = files.map(file => `${Date.now()}-${file.originalname}`);
  
  files.forEach((file, index) => {
    const newPath = `../client/public/document/${fileNames[index]}`;
    fs.renameSync(file.path, newPath);
  });

  res.status(200).json(fileNames); // Send back the filenames
});

// Define the route to delete an uploaded file
app.delete("/delete-upload", (req, res) => {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Define the file path - make sure it matches your actual file storage path
  const filePath = path.join(__dirname, "../client/public/upload", filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).json({ error: "File not found" });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "Failed to delete file" });
      }

      return res.status(200).json({ message: "File deleted successfully" });
    });
  });
});

const landingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/landing-content"); // Adjust path as needed
  },
  filename: function (req, file, cb) {
    cb(null, "home-background.jpg"); // Always rename to home-background.jpg
  }
})

const uploadLanding = multer({ storage: landingStorage });

app.post("/upload-home-background", uploadLanding.single("home-background"), (req, res) => {
  const file = req.file;
  console.log(file);
  if (!file) return res.status(400).json("No file uploaded.");

  res.status(200).json({ message: "Background image uploaded successfully" });
});

app.delete("/delete-home-background", (req, res) => {
  // Define the file path for the background image
  const filePath = path.join(__dirname, "../client/public/landing-content/home-background.jpg");

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file does not exist, send an error response
      return res.status(404).json({ message: "Background image not found." });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting background image:", err);
        return res.status(500).json({ message: "Failed to delete background image." });
      }

      // Successfully deleted the file
      return res.status(200).json({ message: "Background image deleted successfully." });
    });
  });
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/relationships", relationshipRoutes);
app.use("/shoplistings", shoplistingsRoutes);
app.use("/events", eventRoutes);
app.use("/articles", articleRoutes);
app.use("/review", reviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/meetups", meetupRoutes);
app.use("/search", searchRoutes);
app.use("/friendRequest", friendRequestRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/admin", adminRoutes);
app.use("/shopreviews", shopreviewRoutes);
app.use("/advertise", advertiseRoute);
app.use("/landing", landingRoutes)
app.use("/myrewards", myrewardsRoutes);
app.use("/owner", ownerRoutes);

app.use('/test', testRoutes);

app.listen(3001, () => {
  console.log("running port 3001");
});
