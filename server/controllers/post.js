import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// no changes needed to fit new database design
// Get posts for a specific user or feed
export const getPosts = async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    let q;
    let values = [];

    if (userId) {
      // Query for posts for a specific profile page
      q = `
        SELECT 
        p.*, 
        s.name AS shop_name,  
        u.name AS name, 
        u.profilePic,
        GROUP_CONCAT(pi.img) AS img,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM posts AS p
      JOIN users AS u ON u.id = p.userid
      LEFT JOIN postimage pi ON pi.post_id = p.id
      LEFT JOIN shoplistings s ON s.shop_id = p.shop_id
      LEFT JOIN postcategories pcs ON pcs.post_id = p.id
        LEFT JOIN postcategory c ON c.id = pcs.category_id
      WHERE u.id = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC;
      `;
      values = [userId];
    } else {
      // Query for posts for the logged-in user's feed
      q = `
      SELECT 
        p.*, 
        s.name AS shop_name,
        u.name AS name, 
        u.profilePic,
        GROUP_CONCAT(pi.img) AS img,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN postimage pi ON pi.post_id = p.id
      LEFT JOIN relationships AS r ON p.userId = r.followedUserId
      LEFT JOIN shoplistings s ON s.shop_id = p.shop_id
      LEFT JOIN postcategories pcs ON pcs.post_id = p.id
      LEFT JOIN postcategory c ON c.id = pcs.category_id
      LEFT JOIN friendrequest fr 
        ON (
          (fr.sender_id = p.userId AND fr.recipient_id = ?) OR 
          (fr.recipient_id = p.userId AND fr.sender_id = ?)
        ) AND fr.status_id = 5
      WHERE 
        (r.followerUserId = ? OR p.userId = ?) 
        OR fr.id IS NOT NULL
      GROUP BY p.id
      ORDER BY p.createdAt DESC;
    `;
      values = [userInfo.id, userInfo.id, userInfo.id, userInfo.id];
    }

    // Fetch posts
    const [postsData] = await db.query(q, values);

    if (postsData.length === 0) {
      return res.status(200).json(postsData); // No posts found
    }

    // Check if the posts are saved by the logged-in user
    const postIds = postsData.map((post) => post.id);

    const checkSavedQuery = `
      SELECT post_id FROM favoriteposts 
      WHERE user_id = ? AND post_id IN (${postIds.join(",")})
    `;
    const [savedPostsData] = await db.query(checkSavedQuery, [userInfo.id]);

    // Convert saved posts into a set for easy lookup
    const savedPostIds = new Set(savedPostsData.map((post) => post.post_id));

    // Add 'saved' status and totalComments to each post
    const postsWithDetails = postsData.map((post) => ({
      ...post,
      saved: savedPostIds.has(post.id), // Check if the post is saved
    }));
    return res.status(200).json(postsWithDetails);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getAllPostsWithImage = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    // Query for posts with images
    const q = `
      SELECT 
        p.*, 
        s.name AS shop_name,  
        u.name AS name, 
        u.profilePic,
        GROUP_CONCAT(pi.img) AS img,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN postimage pi ON pi.post_id = p.id
      LEFT JOIN shoplistings s ON s.shop_id = p.shop_id
      LEFT JOIN postcategories pcs ON pcs.post_id = p.id
      LEFT JOIN postcategory c ON c.id = pcs.category_id
      WHERE pi.img IS NOT NULL
      GROUP BY p.id
      ORDER BY p.createdAt DESC;
    `;

    // Fetch posts
    const [postsData] = await db.query(q);

    if (postsData.length === 0) {
      return res.status(200).json(postsData); // No posts found
    }

    // Add 'saved' status to each post
    const postIds = postsData.map((post) => post.id);

    const checkSavedQuery = `
      SELECT post_id FROM favoriteposts 
      WHERE user_id = ? AND post_id IN (${postIds.join(",")})
    `;
    const [savedPostsData] = await db.query(checkSavedQuery, [userInfo.id]);

    // Convert saved posts into a set for easy lookup
    const savedPostIds = new Set(savedPostsData.map((post) => post.post_id));

    // Add 'saved' status to each post
    const postsWithDetails = postsData.map((post) => ({
      ...post,
      saved: savedPostIds.has(post.id),
    }));

    return res.status(200).json(postsWithDetails);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getPostById = async (req, res) => {
  const postId = req.params.id; // Post ID passed as a parameter
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    // Query to fetch the specific post details
    const postQuery = `
      SELECT 
        p.*, 
        s.name AS shop_name,  
        s.shop_id,
        u.name AS name, 
        u.profilePic,
        GROUP_CONCAT(pi.img) AS img,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
        GROUP_CONCAT(DISTINCT c.id) AS categories
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN postimage pi ON pi.post_id = p.id
      LEFT JOIN shoplistings s ON s.shop_id = p.shop_id
      LEFT JOIN Ppostcategories pcs ON pcs.post_id = p.id
      LEFT JOIN postcategory c ON c.id = pcs.category_id
      WHERE p.id = ?
      GROUP BY p.id;
    `;

    const [postData] = await db.query(postQuery, [postId]);

    if (postData.length === 0) {
      return res.status(404).json("Post not found");
    }

    const post = postData[0];

    // Check if the post is saved by the logged-in user
    const checkSavedQuery = `
      SELECT post_id FROM favoriteposts 
      WHERE user_id = ? AND post_id = ?
    `;
    const [savedPostData] = await db.query(checkSavedQuery, [
      userInfo.id,
      postId,
    ]);

    // Add 'saved' status to the post
    post.saved = savedPostData.length > 0;

    return res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const addPosts = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const coinsNeeded = 10;
    const { desc, imgs, shop_id, categories, advertised } = req.body;

    // Get user type
    const [typeresult] = await db.query(
      `SELECT t.type_name FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userInfo.id]
    );
    const typename = typeresult[0].type_name;

    // Handle coins deduction for "owner" and advertised posts
    if (typename === "owner" && advertised) {
      const [response] = await db.query(
        `SELECT coins FROM shopowners WHERE id = ?`,
        [userInfo.id]
      );
      if (response[0].coins < coinsNeeded) {
        return res.status(400).json("Not enough coins.");
      } else {
        await db.query(`UPDATE shopowners SET coins = coins - ? WHERE id = ?`, [
          coinsNeeded,
          userInfo.id,
        ]);
      }
    }

    // Calculate expiration date for advertised posts
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const expirationDate = advertised
      ? moment().add(14, "days").format("YYYY-MM-DD")
      : null;

    // Insert the post
    const postQuery = `
      INSERT INTO posts (\`desc\`, \`userId\`, \`createdAt\`, \`shop_id\`, \`advertised\`, \`advertise_expire_date\`) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const postValues = [
      desc,
      userInfo.id,
      createdAt,
      shop_id,
      advertised ? 1 : 0,
      expirationDate,
    ];
    const [postResult] = await db.query(postQuery, postValues);

    if (!postResult.affectedRows) {
      return res.status(500).json("Failed to create post");
    }

    const postId = postResult.insertId;

    // Insert images associated with the post
    if (imgs && imgs.length > 0) {
      const imageQuery = `INSERT INTO postimage (\`post_id\`, \`img\`) VALUES (?, ?)`;
      const imageInsertPromises = imgs.map((img) =>
        db.query(imageQuery, [postId, img])
      );
      await Promise.all(imageInsertPromises);
    }

    // Insert categories associated with the post
    if (categories && categories.length > 0) {
      const categoryQuery = `INSERT INTO postcategories (\`post_id\`, \`category_id\`) VALUES (?, ?)`;
      const categoryInsertPromises = categories.map((categoryId) =>
        db.query(categoryQuery, [postId, categoryId])
      );
      await Promise.all(categoryInsertPromises);
    }

    // Log the user activity for creating a post
    const [activityId] = await db.query(
      `SELECT id FROM activitytype WHERE type_name = ?`,
      ["post creation"]
    );
    await db.query(`INSERT INTO activity(user_id, type_id) VALUES(?, ?)`, [
      userInfo.id,
      activityId[0].id,
    ]);

    // Update points for regular users
    if (typename === "regular" || typename === "expert") {
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
    }

    // Step 1: Fetch followers
    const followersQuery = `
      SELECT followerUserId 
      FROM relationships 
      WHERE followedUserId = ?
    `;
    const [followers] = await db.query(followersQuery, [userInfo.id]);
    const followerIds = followers.map((row) => row.followerUserId);

    // Step 2: Fetch friends
    const friendsQuery = `
      SELECT sender_id, recipient_id 
      FROM friendrequest 
      WHERE status_id = 5 AND (sender_id = ? OR recipient_id = ?)
    `;
    const [friends] = await db.query(friendsQuery, [userInfo.id, userInfo.id]);
    const friendIds = friends.map((row) =>
      row.sender_id === userInfo.id ? row.recipient_id : row.sender_id
    );

    // Step 3: Combine IDs (friends and followers) without duplicates
    const recipientIds = [...new Set([...followerIds, ...friendIds])];

    // Step 4: Send notifications
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`post_id\`) 
      VALUES (?, ?, ?, ?)
    `;
    const notificationPromises = recipientIds.map((recipientId) =>
      db.query(notificationQuery, [
        recipientId,
        userInfo.id,
        "add post",
        postId,
      ])
    );
    await Promise.all(notificationPromises);

    return res
      .status(200)
      .json("Post shared successfully! Notifications sent.");
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const updatePost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { postId } = req.params;
    const { desc, imgs, shop_id, categories } = req.body;

    const [postExists] = await db.query(
      `SELECT * FROM posts WHERE id = ? AND userId = ?`,
      [postId, userInfo.id]
    );
    if (!postExists.length)
      return res.status(404).json("Post not found or unauthorized");

    const updatePostQuery = `
      UPDATE posts 
      SET \`desc\` = ?, \`shop_id\` = ?
      WHERE id = ?;
    `;
    const updatePostValues = [desc, shop_id, postId];
    await db.query(updatePostQuery, updatePostValues);

    // Handle images
    if (!imgs || imgs.length === 0) {
      // Delete all images if no images are sent
      await db.query(`DELETE FROM postimage WHERE post_id = ?`, [postId]);
    } else {
      const [existingImages] = await db.query(
        `SELECT img FROM postimage WHERE post_id = ?`,
        [postId]
      );
      const existingImagePaths = existingImages.map((row) => row.img);

      const imagesToDelete = existingImagePaths.filter(
        (img) => !imgs.includes(img)
      );

      if (imagesToDelete.length > 0) {
        await db.query(
          `DELETE FROM postimage WHERE post_id = ? AND img IN (?)`,
          [postId, imagesToDelete]
        );
      }

      const newImages = imgs.filter((img) => !existingImagePaths.includes(img));
      if (newImages.length > 0) {
        const imageQuery = `INSERT INTO postimage (\`post_id\`, \`img\`) VALUES (?, ?)`;
        const imageInsertPromises = newImages.map((img) =>
          db.query(imageQuery, [postId, img])
        );
        await Promise.all(imageInsertPromises);
      }
    }

    // Handle categories
    if (!categories || categories.length === 0) {
      await db.query(`DELETE FROM postcategories WHERE post_id = ?`, [postId]);
    } else {
      await db.query(`DELETE FROM postcategories WHERE post_id = ?`, [postId]);
      const categoryQuery = `INSERT INTO postcategories (\`post_id\`, \`category_id\`) VALUES (?, ?)`;
      const categoryInsertPromises = categories.map((categoryId) =>
        db.query(categoryQuery, [postId, categoryId])
      );
      await Promise.all(categoryInsertPromises);
    }

    const [activityId] = await db.query(
      `SELECT id FROM activitytype WHERE type_name = ?`,
      ["post update"]
    );
    if (activityId.length > 0) {
      await db.query(`INSERT INTO activity(user_id, type_id) VALUES(?, ?)`, [
        userInfo.id,
        activityId[0].id,
      ]);
    }

    return res.status(200).json("Post updated successfully!");
  } catch (err) {
    console.error("Error updating post:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

export const sharePost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { postId, friends } = req.body; // `friends` should be an array of user IDs

    // Ensure the required data is provided
    if (!postId || !friends || friends.length === 0) {
      return res
        .status(400)
        .json({ error: "Post ID and selected friends are required" });
    }

    // Validate if the post exists
    const [postExists] = await db.query(`SELECT * FROM posts WHERE id = ?`, [
      postId,
    ]);
    if (!postExists.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Insert notifications for each selected friend
    const notificationQuery = `
      INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`post_id\`, \`created_on\`) 
      VALUES (?, ?, 'share post', ?, NOW())
    `;

    const notificationPromises = friends.map((friendId) =>
      db.query(notificationQuery, [friendId, userInfo.id, postId])
    );

    // Execute all notification insertions
    await Promise.all(notificationPromises);

    res
      .status(200)
      .json({ message: "Post shared successfully with selected friends" });
  } catch (err) {
    console.error("Error sharing post:", err.message);
    res
      .status(500)
      .json({ error: "Failed to share post", details: err.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const q = "DELETE FROM posts WHERE id = ? AND userId = ?";
    const values = [req.params.id, userInfo.id];

    const [data] = await db.query(q, values);

    if (data.affectedRows > 0) {
      return res.status(200).json("Post has been deleted");
    }

    return res.status(403).json("You can delete only your post");
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
};

export const getCategories = async (req, res) => {
  const q = `SELECT * FROM postcategory;`; // SQL query to fetch categories

  try {
    const [data] = await db.query(q); // Execute the query using promise-based syntax
    return res.status(200).json(data); // Send the data back to the client
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "Database error", details: err.message });
  }
};

// get all posts of a shop
export const getPostsByShop = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const { shopId, ownerId } = req.query; // Extract shopId and ownerId from query parameters

    if (!shopId) return res.status(400).json("Shop ID is required.");

    // Query to fetch all posts for a specific shop, optionally filtering by ownerId
    const q = `
      SELECT 
        p.*, 
        s.name AS shop_name,  
        u.name AS name, 
        u.profilePic,
        GROUP_CONCAT(pi.img) AS img,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN postimage pi ON pi.post_id = p.id
      LEFT JOIN shoplistings s ON s.shop_id = p.shop_id
      LEFT JOIN postcategories pcs ON pcs.post_id = p.id
      LEFT JOIN postcategory c ON c.id = pcs.category_id
      WHERE p.shop_id = ?
      ${
        ownerId ? "AND p.userid = ?" : ""
      }  -- Include ownerId filter if provided
      GROUP BY p.id
      ORDER BY p.createdAt DESC;
    `;

    // Prepare query parameters
    const queryParams = [shopId];
    if (ownerId) queryParams.push(ownerId); // Add ownerId to parameters if provided

    // Fetch posts for the given shop ID and optional owner ID
    const [postsData] = await db.query(q, queryParams);

    if (postsData.length === 0) {
      return res.status(200).json(postsData); // No posts found
    }

    // Add 'saved' status to each post
    const postIds = postsData.map((post) => post.id);

    const checkSavedQuery = `
      SELECT post_id FROM favoriteposts 
      WHERE user_id = ? AND post_id IN (${postIds.join(",")})
    `;
    const [savedPostsData] = await db.query(checkSavedQuery, [userInfo.id]);

    // Convert saved posts into a set for easy lookup
    const savedPostIds = new Set(savedPostsData.map((post) => post.post_id));

    // Add 'saved' status to each post
    const postsWithDetails = postsData.map((post) => ({
      ...post,
      saved: savedPostIds.has(post.id),
    }));

    return res.status(200).json(postsWithDetails);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
