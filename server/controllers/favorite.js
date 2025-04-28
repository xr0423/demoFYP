import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// Helper function to verify token
const verifyToken = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    return userInfo.id;
  } catch (error) {
    res.status(403).json("Invalid Token!");
    return null;
  }
};

// Controller: Add a favorite post
export const addfavPost = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { postId } = req.body;
  try {
    // Insert into FavoritePosts
    const query = `INSERT INTO favoriteposts (user_id, post_id) VALUES (?, ?)`;
    await db.query(query, [userId, postId]);

    // Get the owner of the post
    const ownerQuery = `SELECT userid FROM posts WHERE id = ?`;
    const [postOwnerResult] = await db.query(ownerQuery, [postId]);

    if (postOwnerResult.length > 0) {
      const postOwnerId = postOwnerResult[0].userid;

          // Add a notification for the post owner
          const notificationQuery = `
              INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`post_id\`) 
              VALUES (?, ?, ?, ?)
          `;
      await db.query(notificationQuery, [
        postOwnerId, // The owner of the post
        userId, // The user who added the post to favorites
        "save post", // Notification type
        postId, // The post ID
      ]);
    }

    res.status(201).json("Favorite post added and owner notified.");
  } catch (error) {
    console.error("Error adding favorite post:", error);
    res.status(500).json(error);
  }
};

// Controller: Add a favorite shop
export const addfavShop = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { shopId } = req.body;
  try {
    const query = `NSERT INTO favoriteshops (user_id, shop_id) VALUES (?, ?)`;
    await db.query(query, [userId, shopId]);
    res.status(201).json("Favorite shop added.");
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Add a favorite article
export const addfavArticle = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { articleId } = req.body;

  try {
    // Step 1: Insert into FavoriteArticles
    const query = `INSERT INTO favoritearticles (user_id, article_id) VALUES (?, ?)`;
    await db.query(query, [userId, articleId]);

    // Step 2: Fetch the author of the article from the articles table
    const authorQuery = `SELECT author_id FROM articles WHERE id = ?`;
    const [authorResult] = await db.query(authorQuery, [articleId]);

    // Step 3: Notify the author if they exist
    if (authorResult.length > 0) {
      const authorId = authorResult[0].author_id;

          const notificationQuery = `
              INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`article_id\`)
              VALUES (?, ?, ?, ?)
          `;
      await db.query(notificationQuery, [
        authorId, // Notify the author
        userId, // The user who favorited the article
        "save article", // Notification type
        articleId, // Reference to the article
      ]);
    }

    // Step 4: Respond to the client
    res.status(201).json("Favorite article added and author notified.");
  } catch (error) {
    console.error("Error adding favorite article:", error); // Log error
    res
      .status(500)
      .json({ error: "Failed to add favorite article", details: error });
  }
};

// Controller: Get favorite posts
export const getfavPost = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    const query = `
          SELECT 
              p.*, 
              s.name AS shop_name,
              u.name AS name, 
              u.profilePic,
              GROUP_CONCAT(pi.img) AS img,
              (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
              GROUP_CONCAT(DISTINCT c.name) AS categories
          FROM 
              posts AS p
          JOIN 
              users AS u ON u.id = p.userid
          JOIN 
              favoriteposts ON favoriteposts.post_id = p.id  -- Join the favorite posts table
          LEFT JOIN 
              postimage AS pi ON pi.post_id = p.id
          LEFT JOIN 
              shoplistings AS s ON s.shop_id = p.shop_id
          LEFT JOIN 
              postcategories AS pcs ON pcs.post_id = p.id
          LEFT JOIN 
              postcategory AS c ON c.id = pcs.category_id
          WHERE 
              favoriteposts.user_id = ?  -- Filter by the user who has favorited the posts
          GROUP BY 
              p.id
          ORDER BY 
              p.createdAt DESC;

      `;
    const [data] = await db.query(query, [userId]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Get favorite shops
export const getfavShop = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    const query = `
          SELECT 
        shoplistings.*,
        users.name AS ownerName, 
        users.profilePic AS ownerProfilePic,
        shoptype.type_name AS shopType,
        COALESCE(AVG(shopreviews.rating), 0) AS rating
    FROM favoriteshops 
    JOIN shoplistings ON favoriteshops.shop_id = shoplistings.shop_id
    JOIN users ON shoplistings.owner_id = users.id
    JOIN shoptype ON shoplistings.type_id = shoptype.id
    LEFT JOIN shopreviews ON shopreviews.shop_id = shoplistings.shop_id
    WHERE favoriteshops.user_id = ?
    GROUP BY shoplistings.shop_id`;
    const [data] = await db.query(query, [userId]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Get favorite articles
export const getfavArticle = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    const query = `
          SELECT 
              articles.*, 
              users.name AS authorName, 
              users.profilePic AS authorProfilePic 
          FROM favoritearticles 
          JOIN articles ON favoritearticles.article_id = articles.id
          JOIN users ON articles.author_id = users.id
          WHERE favoritearticles.user_id = ?
          ORDER BY createdAt DESC
          `;
    const [data] = await db.query(query, [userId]);
    console.log("Fetched favorite articles with author info:", data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Delete a favorite post
export const delfavPost = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { postId } = req.query;
  try {
    const query = `DELETE FROM favoriteposts WHERE user_id = ? AND post_id = ?`;
    await db.query(query, [userId, postId]);
    res.status(200).json("Favorite post removed.");
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Delete a favorite shop
export const delfavShop = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { shopId } = req.query;
  try {
    const query = `DELETE FROM favoriteshops WHERE user_id = ? AND shop_id = ?`;
    await db.query(query, [userId, shopId]);
    res.status(200).json("Favorite shop removed.");
  } catch (error) {
    res.status(500).json(error);
  }
};

// Controller: Delete a favorite article
export const delfavArticle = async (req, res) => {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { articleId } = req.query;
  try {
    const query = `DELETE FROM favoritearticles WHERE user_id = ? AND article_id = ?`;
    await db.query(query, [userId, articleId]);
    res.status(200).json("Favorite article removed.");
  } catch (error) {
    res.status(500).json(error);
  }
};

// Add a post to favorites
export const addFavorite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const userId = userInfo.id;
    const postId = req.query.postId;

    if (!postId) return res.status(400).json("Post ID is required");

    console.log(
      "Checking if post is already saved for user:",
      userId,
      "postId:",
      postId
    );

    // Check if the post is already in favorites
    const checkQuery =
      "SELECT * FROM favoriteposts WHERE user_id = ? AND post_id = ?";
    const [checkData] = await db.query(checkQuery, [userId, postId]);

    if (checkData.length > 0) {
      return res
        .status(400)
        .json({ message: "Post is already added to favorites" });
    }

    // Add the post to favorites if not already saved
    const query = "INSERT INTO favoriteposts (user_id, post_id) VALUES (?, ?)";
    await db.query(query, [userId, postId]);

    console.log("Post added to favorites");
    return res.status(200).json({ message: "Post added to favorites" });
  } catch (err) {
    console.error("Error adding favorite:", err);
    return res.status(500).json({ error: "Failed to add favorite" });
  }
};

// Get all favorite posts for a user
export const getFavorites = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const userId = userInfo.id;

    console.log("Fetching favorites for user:", userId);

    const query =
      "SELECT p.* FROM posts p JOIN favoriteposts f ON p.id = f.post_id WHERE f.user_id = ?";
    const [favorites] = await db.query(query, [userId]);

    console.log("Favorites fetched:", favorites);
    return res.status(200).json(favorites);
  } catch (err) {
    console.error("Error retrieving favorites:", err);
    return res.status(500).json({ error: "Failed to retrieve favorites" });
  }
};

// Delete a post from favorites
export const deleteFavorites = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const userId = userInfo.id;
    const postId = req.query.postId;

    if (!postId) return res.status(400).json("Post ID is required");

    console.log("Deleting favorite for user:", userId, "postId:", postId);

    const query = "DELETE FROM favoritposts WHERE user_id = ? AND post_id = ?";
    const [result] = await db.query(query, [userId, postId]);

    if (result.affectedRows > 0) {
      console.log("Post removed from favorites");
      return res.status(200).json({ message: "Post removed from favorites" });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (err) {
    console.error("Error deleting favorite:", err);
    return res.status(500).json({ error: "Failed to delete favorite" });
  }
};

// Check if a post is saved to favorites
export const isPostSaved = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const userId = userInfo.id;
    const postId = req.query.postId;

    if (!postId) return res.status(400).json("Post ID is required");

    const query =
      "SELECT * FROM favoriteposts WHERE `user_id` = ? AND `post_id` = ?";
    const [data] = await db.query(query, [userId, postId]);

    if (data.length > 0) {
      return res.status(200).json({ saved: true });
    } else {
      return res.status(200).json({ saved: false });
    }
  } catch (err) {
    console.error("Error checking if post is saved:", err);
    return res.status(500).json({ error: "Failed to check post save status" });
  }
};

// Controller: Get Post Favorite Status
export const getPostFavStatus = async (req, res) => {
  try {
    const userId = verifyToken(req); // Get user ID from token
    const { id: postId } = req.params; // Get post ID from params

    const [result] = await db.query(
      "SELECT * FROM favoriteposts WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    res.status(200).json({ saved: result.length > 0 });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Controller: Get Shop Favorite Status
export const getShopFavStatus = async (req, res) => {
  try {
    const userId = verifyToken(req); // Get user ID from token
    const { id: shopId } = req.params; // Get shop ID from params

    const [result] = await db.query(
      "SELECT * FROM favoriteshops WHERE shop_id = ? AND user_id = ?",
      [shopId, userId]
    );

    res.status(200).json({ saved: result.length > 0 });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Controller: Get Article Favorite Status
export const getArticleFavStatus = async (req, res) => {
  try {
    const userId = verifyToken(req); // Get user ID from token
    const { id: articleId } = req.params; // Get article ID from params

    const [result] = await db.query(
      "SELECT * FROM favoritearticles WHERE article_id = ? AND user_id = ?",
      [articleId, userId]
    );

    res.status(200).json({ saved: result.length > 0 });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
