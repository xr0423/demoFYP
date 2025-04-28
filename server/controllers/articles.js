import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";

// Helper function to verify token
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "secretkey", (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

// Controller for fetching topics
export const getArticleTopics = async (req, res) => {
  try {
    // Query the articletopic table to get all topics
    const [topics] = await db.query("SELECT id, topic_name FROM articletopic");

    // Return the topics to the client
    res.status(200).json(topics);
  } catch (err) {
    console.error("Error fetching article topics:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch article topics", details: err.message });
  }
};

// Create a new article
export const createArticle = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = await verifyToken(token);
    const { title, mainContext, topic, img } = req.body; // `img` should now be an array

    console.log("Received img:", img); // Debugging check

    // Step 1: Insert the article into the `Articles` table
    const [articleResult] = await db.execute(
      `INSERT INTO articles (title, content, author_id, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [title, mainContext, userInfo.id]
    );

    const articleId = articleResult.insertId;

    // Step 2: Insert images into the `articleimages` table
    if (Array.isArray(img) && img.length > 0) {
      const imageInsertPromises = img.map((imageUrl) =>
        db.execute(
          `INSERT INTO articleimages (article_id, img) VALUES (?, ?)`,
          [articleId, imageUrl]
        )
      );

      await Promise.all(imageInsertPromises);
    }

    // Step 3: Insert topics into the `Article_Topics` table, if provided
    if (topic && topic.length > 0) {
      const topicsArray = Array.isArray(topic) ? topic : topic.split(",");
      const [topicIdsResult] = await db.query(
        `SELECT id FROM articletopic WHERE topic_name IN (?)`,
        [topicsArray]
      );

      const topicInsertPromises = topicIdsResult.map((row) =>
        db.execute(
          `INSERT INTO article_topics (article_id, topic_id) VALUES (?, ?)`,

          [articleId, row.id]
        )
      );

      await Promise.all(topicInsertPromises);
    }
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

    res.status(201).json({ message: "Article created successfully!" });
  } catch (err) {
    console.error("Error creating article:", err.message);
    res
      .status(500)
      .json({ error: "Failed to create article", details: err.message });
  }
};

// Get article by ID
export const getArticleById = async (req, res) => {
  const articleId = req.params.articleId;

  try {
    if (!articleId) {
      return res.status(400).json({ error: "Article ID is required" });
    }

    // Query for the main article data and author details
    const articleQuery = `
      SELECT a.*, u.name AS author_name, u.profilePic AS author_profile
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `;
    const [articleData] = await db.query(articleQuery, [articleId]);

    if (articleData.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = articleData[0];

    // Query for all associated images in the `articleimages` table
    const imageQuery = `SELECT img FROM articleimages WHERE article_id = ?`;
    const [imageData] = await db.query(imageQuery, [articleId]);

    // Format the image paths and add them to the article as an array
    article.images = imageData.map((imgRow) => `/upload/${imgRow.img}`);

    // Query for the count of likes for the article
    const likesQuery = `SELECT COUNT(*) AS likeCount FROM likes WHERE articleid = ?`;
    const [likesData] = await db.query(likesQuery, [articleId]);
    article.likes = likesData[0].likeCount || 0;

    res.status(200).json(article);
  } catch (err) {
    console.error("Error fetching article:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch article", details: err.message });
  }
};

// Delete article by ID
export const deleteArticle = async (req, res) => {
  const articleId = req.params.id;
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = await verifyToken(token);

    // Check if the article exists and belongs to the user
    const [article] = await db.query(
      "SELECT * FROM articles WHERE id = ? AND author_id = ?",
      [articleId, userInfo.id]
    );

    if (article.length === 0) {
      return res
        .status(404)
        .json("Article not found or not authorized to delete.");
    }

    // Delete the article from the database
    await db.query("DELETE FROM articles WHERE id = ?", [articleId]);

    res.status(200).json("Article deleted successfully!");
  } catch (err) {
    console.error("Error deleting article:", err.message);
    res
      .status(500)
      .json({ error: "Failed to delete article", details: err.message });
  }
};

export const getArticles = async (req, res) => {

  console.log("Received query params:", req.query);
  const userId = req.query.userId;

  console.log("Received userId in getArticles:", userId); // Debugging line
  try {
    // Main query to fetch articles with related information
    let query = `
      SELECT 
        a.id, 
        a.title, 
        a.content, 
        a.img, 
        a.created_at, 
        a.author_id,
        u.name AS author_name, 
        u.profilePic AS author_profile, 
        GROUP_CONCAT(at.topic_name SEPARATOR ', ') AS topics,
        (SELECT COUNT(*) FROM Likes l WHERE l.articleid = a.id) AS likes
      FROM articles a
      LEFT JOIN article_Topics at_rel ON a.id = at_rel.article_id
      LEFT JOIN articleTopic at ON at_rel.topic_id = at.id
      LEFT JOIN users u ON a.author_id = u.id
    `;

    const params = [];
    if (userId) {
      // Filter by author if `userId` is provided
      query += ` WHERE a.author_id = ?`;
      params.push(userId);
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

    const [data] = await db.query(query, params);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching articles:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch articles", details: err.message });
  }
};

// Update an article
export const updateArticle = async (req, res) => {
  const articleId = req.params.id;
  console.log("Received request to update article:", req.body);

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = await verifyToken(token);
    const { title, content, topics, img } = req.body; // `img` is an array of image URLs

    // Ensure the user is either the author or a collaborator
    const [article] = await db.query(
      `
      SELECT a.id 
      FROM articles a
      LEFT JOIN articlecollabs ac ON a.id = ac.article_id
      WHERE a.id = ? AND (a.author_id = ? OR ac.collaborator_id = ?)
      `,
      [articleId, userInfo.id, userInfo.id]
    );

    if (article.length === 0) {
      return res.status(404).json("Article not found or not authorized.");
    }

    // Update the Articles table
    const query = `
      UPDATE articles 
      SET title = ?, content = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    await db.query(query, [title, content, articleId]);
    console.log("Article content updated.");

    // Handle image updates
    if (img && img.length > 0) {
      // Delete old images associated with this article
      await db.query("DELETE FROM articleimages WHERE article_id = ?", [
        articleId,
      ]);
      console.log("Old images removed from articleimages table.");

      // Insert new images into the `articleimages` table
      const imageInsertPromises = img.map((imageUrl) =>
        db.query(`INSERT INTO articleimages (article_id, img) VALUES (?, ?)`, [
          articleId,
          imageUrl,
        ])
      );
      await Promise.all(imageInsertPromises); // Wait for all image inserts to complete
      console.log("New images inserted into articleimages table.");
    }

    // Handle topics update
    if (topics && topics.length > 0) {
      await db.query("DELETE FROM article_topics WHERE article_id = ?", [
        articleId,
      ]);
      console.log("Existing topics removed from Article_Topics table.");

      const topicsArray = Array.isArray(topics) ? topics : topics.split(",");
      const [topicIdsResult] = await db.query(
        `SELECT id FROM articletopic WHERE topic_name IN (?)`,
        [topicsArray]
      );

      console.log("Topics to be inserted:", topicIdsResult);

      const topicInsertPromises = topicIdsResult.map((row) =>
        db.query(
          `INSERT INTO article_topics (article_id, topic_id) VALUES (?, ?)`,
          [articleId, row.id]
        )
      );

      await Promise.all(topicInsertPromises); // Wait for all topic inserts to complete
      console.log("Topics inserted into Article_Topics table.");
    }

    res.status(200).json("Article updated successfully!");
  } catch (err) {
    console.error("Error updating article:", err.message);
    res
      .status(500)
      .json({ error: "Failed to update article", details: err.message });
  }
};

// article collabs controllers...
//add
export const addArticleCollab = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = await verifyToken(token);
    const { article_id, collaborator_id } = req.body;

    if (!article_id || !collaborator_id) {
      return res
        .status(400)
        .json("Article ID and Collaborator ID are required");
    }

    // Insert collaboration request into the ArticleCollabs table
    await db.query(
      `INSERT INTO articlecollabs (article_id, author_id, collaborator_id, added_at) 
       VALUES (?, ?, ?, NOW())`,
      [article_id, userInfo.id, collaborator_id]
    );

    // Fetch article details (title) for the notification
    const [article] = await db.query(
      `SELECT title FROM articles WHERE id = ?`,
      [article_id]
    );

    if (article.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Notify the collaborator
    const notificationQuery = `
    INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`article_id\`)
    VALUES (?, ?, ?, ?)
    `;
    await db.query(notificationQuery, [
      collaborator_id, // Recipient (collaborator, corresponding to `to` column)
      userInfo.id, // Sender (current user, corresponding to `from` column)
      "article collab", // Notification type
      article_id, // Article ID
    ]);

    res
      .status(201)
      .json({ message: "Collaborator added successfully and notified!" });
  } catch (err) {
    console.error("Error adding collaborator:", err.message);
    res
      .status(500)
      .json({ error: "Failed to add collaborator", details: err.message });
  }
};

//get
export const getArticleCollabs = async (req, res) => {
  const articleId = req.params.articleId;

  if (!articleId) return res.status(400).json("Article ID is required");

  try {
    const [collabs] = await db.query(
      `SELECT u.id AS collaborator_id, u.name AS collaborator_name, u.profilePic AS collaborator_profile
       FROM articlecollabs ac
       JOIN users u ON ac.collaborator_id = u.id
       WHERE ac.article_id = ?`,
      [articleId]
    );

    const collaborators = collabs.map((collab) => ({
      ...collab,
      collaborator_profile: collab.collaborator_profile
        ? `/upload/${collab.collaborator_profile}`
        : "/upload/profilepic.png",
    }));

    res.status(200).json(collaborators);
  } catch (err) {
    console.error("Error fetching collaborators:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch collaborators", details: err.message });
  }
};

//remove
export const removeArticleCollab = async (req, res) => {
  const token = req.cookies.accessToken;
  const { articleId, collaboratorId } = req.params;

  if (!token) return res.status(401).json("Not Logged In!");
  if (!articleId || !collaboratorId)
    return res.status(400).json("Article ID and Collaborator ID are required");

  try {
    const userInfo = await verifyToken(token);

    const [article] = await db.query(
      `SELECT * FROM articles WHERE id = ? AND author_id = ?`,
      [articleId, userInfo.id]
    );

    if (article.length === 0) {
      return res
        .status(403)
        .json("Not authorized to remove this collaborator.");
    }

    await db.query(
      `DELETE FROM articlecollabs WHERE article_id = ? AND collaborator_id = ?`,
      [articleId, collaboratorId]
    );

    res.status(200).json("Collaborator removed successfully!");
  } catch (err) {
    console.error("Error removing collaborator:", err.message);
    res
      .status(500)
      .json({ error: "Failed to remove collaborator", details: err.message });
  }
};

// Get all collaborators for the current user
export const getCollaborators = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = await verifyToken(token);
    console.log("User Info:", userInfo);

    // Query to fetch collaborators with details, including profilePic
    const [collaborators] = await db.query(
      `SELECT DISTINCT 
          CASE 
            WHEN ac.collaborator_id = ? THEN u2.id 
            ELSE u.id 
          END AS collaborator_id,
          CASE 
            WHEN ac.collaborator_id = ? THEN u2.name 
            ELSE u.name 
          END AS name,
          CASE 
            WHEN ac.collaborator_id = ? THEN u2.profilePic 
            ELSE u.profilePic 
          END AS profilePic
        FROM articlecollabs ac
        JOIN users u ON ac.collaborator_id = u.id
        JOIN users u2 ON ac.author_id = u2.id
        WHERE ac.author_id = ? OR ac.collaborator_id = ?`,
      [userInfo.id, userInfo.id, userInfo.id, userInfo.id, userInfo.id]
    );

    console.log("Raw Collaborators Data:", collaborators);

    // Map collaborators data to expected format
    const formattedCollaborators = collaborators.map((collaborator) => ({
      id: collaborator.collaborator_id,
      name: collaborator.name,
      profilePic: collaborator.profilePic, // Ensure profilePic is included here
    }));

    console.log("Formatted Collaborators Data:", formattedCollaborators);

    res.status(200).json(formattedCollaborators);
  } catch (err) {
    console.error("Error fetching collaborators:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch collaborators", details: err.message });
  }
};


// Get articles that the current user and a specific collaborator are collaborating on
export const getCollaboratorArticles = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  const collaboratorId = req.params.collaboratorId;
  if (!collaboratorId)
    return res.status(400).json("Collaborator ID is required");

  try {
    const userInfo = await verifyToken(token);

    const [articles] = await db.query(
      `SELECT a.id, a.title, a.content, a.img, a.created_at, 
              u.name AS author_name, u.profilePic AS author_profile,
              u.id AS author_id, -- Ensure author_id is selected here
              GROUP_CONCAT(at.topic_name SEPARATOR ', ') AS topics
       FROM articles a
       JOIN articlecollabs ac ON a.id = ac.article_id
       LEFT JOIN article_topics at_rel ON a.id = at_rel.article_id
       LEFT JOIN articletopic at ON at_rel.topic_id = at.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE (ac.author_id = ? AND ac.collaborator_id = ?)
          OR (ac.author_id = ? AND ac.collaborator_id = ?)
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [userInfo.id, collaboratorId, collaboratorId, userInfo.id]
    );

    res.status(200).json(articles);
  } catch (err) {
    console.error("Error fetching articles for collaborator:", err.message);
    res.status(500).json({
      error: "Failed to fetch articles for collaborator",
      details: err.message,
    });
  }
};

// remove collaborator including collaborated articles
export const removeCollaborator = async (req, res) => {
  const { collaboratorId } = req.params;
  const token = req.cookies.accessToken;

  if (!token) {
    console.log("No token provided");
    return res.status(401).json("Not Logged In!");
  }

  try {
    const userInfo = await verifyToken(token);
    console.log("Token verified, user info:", userInfo);
    console.log("Removing collaborator with ID:", collaboratorId);

    // Start a transaction
    await db.beginTransaction();

    // Step 1: Remove the collaborator from the ArticleCollabs table
    await db.query(
      `DELETE FROM articlecollabs WHERE collaborator_id = ? OR author_id = ?`,
      [collaboratorId, collaboratorId] // Assuming `collaboratorId` is also the current user ID in this context
    );

    // Step 2: Find all articles associated with this collaborator
    const [articles] = await db.query(
      `SELECT a.id FROM articles a
       JOIN articlecollabs ac ON a.id = ac.article_id
       WHERE ac.collaborator_id = ?`,
      [collaboratorId]
    );
    console.log("Articles associated with collaborator:", articles);

    // Step 3: Delete each article found
    for (const article of articles) {
      const deleteArticleResult = await db.query(
        `DELETE FROM articles WHERE id = ?`,
        [article.id]
      );
      console.log(
        `Article with id ${article.id} removed, result:`,
        deleteArticleResult
      );
    }

    // Commit the transaction if all deletions succeed
    await db.commit();
    console.log("Collaborator and associated articles removed successfully");
    res
      .status(200)
      .json("Collaborator and their articles removed successfully!");
  } catch (err) {
    // Roll back the transaction if there is an error
    await db.rollback();
    console.error("Error removing collaborator:", err.message);
    res
      .status(500)
      .json({ error: "Failed to remove collaborator", details: err.message });
  }
};

export const shareArticle = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { articleId, friends } = req.body; // `friends` should be an array of user IDs

    // Ensure the required data is provided
    if (!articleId || !friends || friends.length === 0) {
      return res
        .status(400)
        .json({ error: "Article ID and selected friends are required" });
    }

    // Validate if the post exists
    const [articleExists] = await db.query(
      `SELECT * FROM articles WHERE id = ?`,
      [articleId]
    );
    if (!articleExists.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Insert notifications for each selected friend
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`article_id\`, \`created_on\`) 
      VALUES (?, ?, 'share article', ?, NOW())
    `;

    const notificationPromises = friends.map((friendId) =>
      db.query(notificationQuery, [friendId, userInfo.id, articleId])
    );

    // Execute all notification insertions
    await Promise.all(notificationPromises);

    res
      .status(200)
      .json({ message: "Article shared successfully with selected friends" });
  } catch (err) {
    console.error("Error sharing Article:", err.message);
    res
      .status(500)
      .json({ error: "Failed to share Article", details: err.message });
  }
};
