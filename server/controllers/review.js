import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getReviewRelatedData = async (req, res) => {
     const checkUserTypeQuery = `SELECT user_type_id FROM users WHERE id = ? `;
     const platformFeatureQuery = `
     SELECT 
          f.id, 
          f.feature_name, 
          f.description, 
          f.feature_image, 
          t.type_name
     FROM rolefeature r 
     JOIN platformfeatures f ON f.id = r.feature_id
     JOIN usertype t ON r.user_type_id = t.id
     WHERE t.id = ?
     `;

     try { 
          // Check if the user is logged in by verifying the token
          const token = req.cookies.accessToken;
          if (!token) {
               return res.status(401).json("Not Logged In!");
          }

          // Verify the token
          const userInfo = jwt.verify(token, "secretkey");

          // Fetch user type from the database
          const [userType] = await db.query(checkUserTypeQuery, [userInfo.id]);

          if (!userType.length) {
               return res.status(401).json("Invalid user data!");
          }

          // Fetch platform features for the user type
          const [platformFeatures] = await db.query(platformFeatureQuery, [
               userType[0].user_type_id,
          ]);

          if (platformFeatures.length > 0) {
               return res.status(200).json(platformFeatures);
          } else {
               return res
                    .status(404)
                    .json({ message: "No platform features found for the user." });
          }
     } catch (err) {
          if (err.name === "JsonWebTokenError") {
               return res.status(403).json("Token is not valid!");
          }

          // Handle database and server errors
          console.error("Server Error:", err); // Log the error for debugging
          return res.status(500).json({ error: "Server error", details: err });
     }
};

export const createReview = async (req, res) => {
     const { feature_id, rating, review_text } = req.body;

     try {
          // Check if the user is logged in by verifying the token
          const token = req.cookies.accessToken;
          if (!token) {
               return res.status(401).json("Not Logged In!");
          }

          // Verify the token
          const userInfo = jwt.verify(token, "secretkey");

          // Prepare and execute the insert query
          const insertQuery = `
               INSERT INTO platformreviews (user_id, feature_id, rating, review_text) 
               VALUES (?, ?, ?, ?)
          `;
          await db.query(insertQuery, [userInfo.id, feature_id, rating, review_text]);

          return res.status(201).json({ message: "Review submitted successfully!" });
     } catch (err) {
          if (err.name === "JsonWebTokenError") {
               return res.status(403).json("Token is not valid!");
          }

          console.error("Server Error:", err);
          return res.status(500).json({ error: "Server error", details: err });
     }
};



// to display at the landing poge
export const getLatestReviewByUserType = async (req, res) => {
     const { minRating = 4.0, maxRating = 5.0 } = req.query;

     const getReviewQuery = `
        SELECT 
            pr.id,
            u.profilePic AS image,
            u.name,
            ut.type_full_name AS user_type,
            ut.type_name AS user_type_name,
            pr.rating,
            pf.feature_name,
            pr.review_text AS review,
            pr.created_at
        FROM platformreviews pr
        JOIN users u ON pr.user_id = u.id
        JOIN usertype ut ON u.user_type_id = ut.id
        JOIN platformfeatures pf ON pr.feature_id = pf.id
        WHERE 
            ut.type_name IN ('regular', 'owner')
            AND pr.rating BETWEEN ? AND ?
        ORDER BY 
            ut.type_name,
            pr.created_at DESC
    `;

     try {
          const [reviews] = await db.query(getReviewQuery, [minRating, maxRating]);

          // Separate reviews by user type
          const response = {
               regular: [],
               owner: []
          };

          reviews.forEach((review) => {
               if (review.user_type_name === 'regular') {
                    response.regular.push(review);
               } else if (review.user_type_name === 'owner') {
                    response.owner.push(review);
               }
          });

          return res.status(200).json(response);
     } catch (err) {
          console.error("Server Error:", err);
          return res.status(500).json({ error: "Server error", details: err });
     }
};


export const getFeatures = async (req, res) => {
     try {
          const featureQuery = `SELECT id, feature_name AS title, description, feature_image AS image FROM platformfeatures`;
          const [features] = await db.query(featureQuery);
          if (features.length > 0) {
               return res.status(200).json(features);
          } else {
               return res.status(204).json({ message: "No features found" });
          }
     } catch (err) {
          console.error("Server Error:", err);
          return res.status(500).json({ error: "Server error", details: err });
     }
};