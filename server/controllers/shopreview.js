import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// Get all reviews or reviews for a specific shop or user
export const getReviews = async (req, res) => {
  const { shopId, userId } = req.query; // Capture both shopId and userId from query params
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    // Base query to retrieve reviews
    let q = `
      SELECT r.review_id, r.shop_id, s.name AS shop_name, r.user_id, u.username, u.profilePic, u.name,
             r.category_id, c.category_name, r.rating, r.review_text, r.reply_text, 
             r.created_at, r.replied_at
      FROM shopreviews r
      JOIN users u ON r.user_id = u.id
      JOIN shoplistings s ON r.shop_id = s.shop_id
      JOIN reviewcategory c ON r.category_id = c.id
    `;

    const queryParams = [];

    // Adjust query based on presence of shopId and userId
    if (shopId) {
      // Fetch all reviews for a specific shop
      q += ` WHERE r.shop_id = ?`;
      queryParams.push(shopId);
    } else if (userId) {
      // Fetch reviews made by the specific user
      q += ` WHERE r.user_id = ?`;
      queryParams.push(userId);
    }

    q += ` ORDER BY r.created_at DESC`;

    // Execute the query
    const [reviews] = await db.query(q, queryParams);

    // Optional: Add rating summary if shopId is provided
    if (shopId) {
      const [ratingSummary] = await db.query(
        `
        SELECT AVG(r.rating) AS averageRating, COUNT(r.review_id) AS reviewCount
        FROM shopreviews r
        WHERE r.shop_id = ?
      `,
        [shopId]
      );

      return res.status(200).json({
        reviews,
        ratingSummary: ratingSummary[0], // Send rating summary only when shopId is provided
      });
    }

    // Send only reviews when no shopId (for MyReviews scenario)
    res.status(200).json({ reviews });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const createReview = async (req, res) => {
  const token = req.cookies.accessToken;
  const { shop_id, category_id, rating, review_text } = req.body;

  if (!shop_id || !category_id || !rating || !review_text) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    // Begin a transaction
    await db.beginTransaction();

    // Step 1: Insert review into shopreviews table
    const insertReviewQuery = `
      INSERT INTO shopreviews (shop_id, user_id, category_id, rating, review_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const reviewValues = [
      shop_id,
      userInfo.id,
      category_id,
      rating,
      review_text,
      moment().format("YYYY-MM-DD HH:mm:ss"),
    ];
    const [reviewResult] = await db.query(insertReviewQuery, reviewValues);

    if (!reviewResult.insertId) {
      throw new Error("Failed to insert review.");
    }

    // Step 2: Fetch the owner_id from shoplistings
    const shopOwnerQuery = `
      SELECT owner_id FROM shoplistings WHERE shop_id = ?;
    `;
    const [shopOwnerResult] = await db.query(shopOwnerQuery, [shop_id]);

    if (!shopOwnerResult.length) {
      throw new Error("Shop owner not found for the provided shop_id.");
    }

    const ownerId = shopOwnerResult[0].owner_id;

    // Step 3: Insert a notification for the shop owner
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`shop_id\`)
      VALUES (?, ?, ?, ?);
    `;
    await db.query(notificationQuery, [
      ownerId, // Recipient (shop owner)
      userInfo.id, // Sender (current user)
      "add review", // Notification type
      shop_id, // Reference to the shopreview_id
    ]);

    // Step 4: Check and update user's points
    const today = moment().format("YYYY-MM-DD");

    // Fetch current points balance and check if points should be awarded today
    const [pointsData] = await db.query(
      `SELECT points_balance, points_obtained, obtained_at 
       FROM rewardpoints 
       WHERE user_id = ?`,
      [userInfo.id]
    );

    if (pointsData.length === 0) {
      throw new Error("User reward points data not found.");
    }

    let { points_balance, points_obtained, obtained_at } = pointsData[0];
    const lastObtainedDate = moment(obtained_at).format("YYYY-MM-DD");

    // Reset daily points if it's a new day
    if (lastObtainedDate !== today) {
      points_obtained = 0;
    }

    // Only add points if the daily limit of 5 has not been reached
    if (points_obtained < 5) {
      const pointsToAward = Math.min(5, 5 - points_obtained);

      // Update points balance, daily obtained points, and obtained_at date
      await db.query(
        `UPDATE rewardpoints
         SET points_balance = points_balance + ?, 
             points_obtained = ?,
             obtained_at = ?
         WHERE user_id = ?`,
        [pointsToAward, points_obtained + pointsToAward, today, userInfo.id]
      );
    }

    // Log the user activity for review creation
    const [activityId] = await db.query(
      `SELECT id FROM ActivityType WHERE type_name = ?`,
      ["review creation"]
    );
    await db.query(`INSERT INTO Activity(user_id, type_id) VALUES(?, ?)`, [
      userInfo.id,
      activityId[0].id,
    ]);

    // Commit the transaction if all operations succeed
    await db.commit();

    return res.status(200).json({
      message:
        "Review has been created, and points added if eligible. Notification sent to the shop owner.",
    });
  } catch (err) {
    // Rollback transaction if any error occurs
    await db.rollback();
    return res.status(500).json({
      error: "Failed to create review and send notification",
      details: err.message,
    });
  }
};
// Edit an existing review
export const editReview = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const { id } = req.query; // review_id
    const { rating, review_text, category_id } = req.body;

    const q = `
      UPDATE shopreviews
      SET category_id = ?, rating = ?, review_text = ?, created_at = ?
      WHERE review_id = ? AND user_id = ?;
    `;

    const values = [
      category_id,
      rating,
      review_text,
      moment().format("YYYY-MM-DD HH:mm:ss"),
      id,
      userInfo.id,
    ];

    const [result] = await db.query(q, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json("Review not found or you're not authorized to update it");
    }
    const [activityId] = await db.query(
      `SELECT id FROM activitytype WHERE type_name = ?`,
      ["review update"]
    );
    await db.query(`INSERT INTO activity(user_id, type_id) VALUES(?, ?)`, [
      userInfo.id,
      activityId[0].id,
    ]);
    return res.status(200).json("Review has been updated");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update review", details: err });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const { id } = req.query; // review_id

    const q = "DELETE FROM shopreviews WHERE review_id = ? AND user_id = ?";

    const [result] = await db.query(q, [id, userInfo.id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json("Review not found or you're not authorized to delete it");
    }

    return res.status(200).json("Review has been deleted");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to delete review", details: err });
  }
};

// Edit reply to an existing review
// Allow shop owner to reply to a review
export const updateReply = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { id } = req.query; // review_id
    const { reply_text } = req.body;

    // Check if the user is the owner of the shop related to this review
    const [result] = await db.query(
      `
      SELECT s.owner_id
      FROM shopreviews r
      JOIN shoplistings s ON r.shop_id = s.shop_id
      WHERE r.review_id = ?;
    `,
      [id]
    );

    if (result.length === 0 || result[0].owner_id !== userInfo.id) {
      return res
        .status(403)
        .json("You're not authorized to reply to this review");
    }

    // Update the reply
    const q = `
      UPDATE shopreviews
      SET reply_text = ?, replied_at = ?
      WHERE review_id = ?;
    `;
    const values = [reply_text, moment().format("YYYY-MM-DD HH:mm:ss"), id];

    await db.query(q, values);
    return res.status(200).json("Reply has been updated");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update reply", details: err });
  }
};
// Controller function to delete a reply
export const deleteReply = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { id } = req.query; // review_id

    // Check if the user is the owner of the shop related to this review
    const [result] = await db.query(
      `SELECT s.owner_id FROM shopreviews r JOIN shoplistings s ON r.shop_id = s.shop_id WHERE r.review_id = ?;`,
      [id]
    );

    if (result.length === 0 || result[0].owner_id !== userInfo.id) {
      return res.status(403).json("You're not authorized to delete this reply");
    }

    // Set reply_text to NULL
    const q = `UPDATE shopreviews SET reply_text = NULL, replied_at = NULL WHERE review_id = ?;`;
    await db.query(q, [id]);

    return res.status(200).json("Reply has been deleted");
  } catch (err) {
    console.error("Error deleting reply:", err);
    return res
      .status(500)
      .json({ error: "Failed to delete reply", details: err });
  }
};

export const getReviewCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM reviewcategory");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
