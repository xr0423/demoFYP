import { db } from "../connect.js"; // Adjust the path to your database connection
import jwt from "jsonwebtoken"; // For JWT verification
import moment from "moment"; // For handling dates
import multer from "multer"; // For handling file uploads
import path from "path";

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid naming collisions
    }
});

const upload = multer({ storage });

// Upload image route
export const uploadImage = (req, res) => {
    const token = req.cookies.accessToken;

    // Check if the user is logged in
    if (!token) return res.status(401).json("Not Logged In!");

    try {
        // Verify the token
        const userInfo = jwt.verify(token, "secretkey");

        const { shopId } = req.body; // Get the shop ID from the request body
        const imgUrl = req.file.path; // Get the image URL

        // Insert the image data into the gallery table
        const q = 'INSERT INTO gallery (shop_id, img_url) VALUES (?, ?)';
        const values = [shopId, imgUrl];

        db.query(q, values, (err, data) => {
            if (err) return res.status(500).json({ error: "Failed to upload image", details: err });
            return res.status(200).json({ message: "Image uploaded successfully!", imgUrl });
        });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json("Token is not valid!");
        }
        return res.status(500).json({ error: "Server error", details: err });
    }
};

// Fetch images for a specific shop
export const getGalleryImages = async (req, res) => {
    const { shopId } = req.params; // Get shopId from route parameters

    try {
        const [images] = await db.query('SELECT * FROM gallery WHERE shop_id = ?', [shopId]);

        return res.status(200).json(images);
    } catch (err) {
        console.error("Error fetching gallery images:", err);
        return res.status(500).json({ error: "Failed to fetch images." });
    }
};
