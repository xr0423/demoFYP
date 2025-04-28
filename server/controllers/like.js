import { db } from '../connect.js';
import jwt from 'jsonwebtoken';

// Get the users who liked a specific post
export const getLikes = async (req, res) => {
    try {
        const q = "SELECT `userId` FROM likes WHERE `postId` = ?";
        const [data] = await db.query(q, [req.query.postId]);

        return res.status(200).json(data.map(like => like.userId));
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Add a like to a post and notify the post owner
export const addLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
      const userInfo = await new Promise((resolve, reject) => {
          jwt.verify(token, "secretkey", (err, decoded) => {
              if (err) reject(err);
              resolve(decoded);
          });
      });

      console.log("User Info:", userInfo); // Log user info
      console.log("Request Body:", req.body); // Log the request body

      const { postId } = req.body;
      if (!postId) return res.status(400).json("Post ID is required");

      // Check if the post exists and fetch the owner
      const postQuery = "SELECT userId FROM posts WHERE id = ?";
      const [postResult] = await db.query(postQuery, [postId]);

      if (postResult.length === 0) {
          return res.status(404).json("Post not found");
      }

      const postOwnerId = postResult[0].userId;

      // Add the like to the database
      const likeQuery = "INSERT INTO likes (`userId`, `postId`) VALUES (?, ?)";
      await db.query(likeQuery, [userInfo.id, postId]);
      console.log("Like added to the database");

      // Add a notification for the post owner
      if (postOwnerId !== userInfo.id) { // Prevent self-notifications
          const notificationQuery = `
              INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`post_id\`)
              VALUES (?, ?, ?, ?)
          `;
          await db.query(notificationQuery, [
              postOwnerId, // Notification recipient (post owner)
              userInfo.id, // Notification sender (user who liked the post)
              "like post", // Notification type
              postId       // Post ID
          ]);
          console.log(`Notification sent to post owner (User ID: ${postOwnerId})`);
      }

      return res.status(200).json("Post has been liked");
  } catch (err) {
      console.error("Error in addLike:", err); // Log the error
      return res.status(500).json(err);
  }
};



// Remove a like from a post
export const deleteLike = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    try {
        const userInfo = await new Promise((resolve, reject) => {
            jwt.verify(token, "secretkey", (err, decoded) => {
                if (err) reject(err);
                resolve(decoded);
            });
        });

        const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
        await db.query(q, [userInfo.id, req.query.postId]);

        return res.status(200).json("Post has been disliked");
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Get the users who liked a specific article
export const getArticleLike = async (req, res) => {
  try {
    const q = "SELECT `userid` FROM likes WHERE `articleid` = ?";
    const [data] = await db.query(q, [req.query.articleId]);

    return res.status(200).json(data.map((like) => like.userid));
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch article likes", details: err });
  }
};

// Add a like to an article
export const addArticleLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: "Article ID is required" });
    }

    // Check if the articleId exists in the articles table
    const [article] = await db.query("SELECT author_id FROM articles WHERE id = ?", [articleId]);
    if (article.length === 0) {
      return res.status(404).json("Article not found");
    }

    const authorId = article[0].author_id;

    // Insert the like into the likes table
    const likeQuery = "INSERT INTO likes (`userid`, `articleid`) VALUES (?, ?)";
    await db.query(likeQuery, [userInfo.id, articleId]);

    // Add a notification for the article owner
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`article_id\`) 
      VALUES (?, ?, ?, ?)
    `;
    await db.query(notificationQuery, [
      authorId,         // The owner of the article
      userInfo.id,      // The user who liked the article
      "like article",  // Notification type
      articleId         // Article ID reference
    ]);

    return res.status(200).json("Article has been liked and notification sent");
  } catch (err) {
    console.error("Error in addArticleLike:", err);
    return res.status(500).json({ error: "Failed to like the article", details: err.message });
  }
};


// Remove a like from an article
export const deleteArticleLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const q = "DELETE FROM likes WHERE `userid` = ? AND `articleid` = ?";
    await db.query(q, [userInfo.id, req.query.articleId]);

    return res.status(200).json("Article has been unliked");
  } catch (err) {
    console.error("Error in deleteArticleLike:", err);
    return res.status(500).json({ error: "Failed to unlike the article", details: err });
  }
};


