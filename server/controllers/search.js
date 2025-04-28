import { db } from "../connect.js";
import jwt from "jsonwebtoken";

const fetchUserDetails = async (user) => {
  const userTypeQuery = `
    SELECT ut.type_name AS type 
    FROM users u 
    JOIN usertype ut ON u.user_type_id = ut.id
    WHERE u.id = ?;
  `;

  const [[userTypeData]] = await db.query(userTypeQuery, [user.id]);
  if (!userTypeData) return null;

  const userType = userTypeData.type.toLowerCase();
  let baseQuery = `
     SELECT 
       u.username,
       u.email,
       u.name,
       c.city_name,
       u.coverPic,
       u.profilePic,
       g.gender_name AS gender,
       ut.type_name AS user_type,
       s.status_name AS status,
       u.dob,
       u.phone,
       u.created_on,
       GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
       GROUP_CONCAT(DISTINCT cb.bean_name) AS fav_beans,
       GROUP_CONCAT(DISTINCT bm.method_name) AS fav_brewing_methods,
       GROUP_CONCAT(DISTINCT ct.type_name) AS fav_coffee_type,
       GROUP_CONCAT(DISTINCT al.allergy_name) AS allergies,
   `;

  let additionalQuery;
  switch (userType) {
    case "owner":
      additionalQuery = `
               so.bio,
               so.coins
               FROM users u
               JOIN shopowners so ON u.id = so.id
             `;
      break;

    case "regular":
      additionalQuery = `
          ru.bio,
          COALESCE((SELECT COUNT(*) FROM relationships WHERE followedUserId = u.id), 0) AS followers,
          COALESCE((SELECT COUNT(*) FROM posts WHERE userid = u.id), 0) AS posts,
          COALESCE((SELECT COUNT(*) FROM shopreviews WHERE user_id = u.id), 0) AS reviews
          FROM Users u
          LEFT JOIN regularusers ru ON u.id = ru.id`;
      break;

    case "expert":
      additionalQuery = `
          ce.highest_education,
          ce.bio,
          GROUP_CONCAT(DISTINCT sp.specialization_name) AS specialization
          FROM Users u
          LEFT JOIN coffeeexperts ce ON u.id = ce.id
          LEFT JOIN expertspecialization es ON ce.id = es.user_id
          LEFT JOIN specialization sp ON sp.id = es.specialization_id
        `;
      break;

    default:
      return null;
  }

  const finalQuery = `
     ${baseQuery}
     ${additionalQuery}
     LEFT JOIN usertags uts ON u.id = uts.user_id
     LEFT JOIN tags t ON uts.tag_id = t.tag_id
     LEFT JOIN usercoffeebeans ub ON u.id = ub.user_id
     LEFT JOIN coffeebeans cb ON ub.bean_id = cb.bean_id
     LEFT JOIN userbrewingmethods ubm ON u.id = ubm.user_id
     LEFT JOIN brewingmethods bm ON bm.method_id = ubm.method_id
     LEFT JOIN usercoffeetypes uft ON u.id = uft.user_id
     LEFT JOIN coffeetypes ct ON uft.type_id = ct.type_id
     LEFT JOIN userallergies ua ON u.id = ua.user_id
     LEFT JOIN allergies al ON ua.allergy_id = al.allergy_id
     JOIN usertype ut ON u.user_type_id = ut.id
     LEFT JOIN gender g ON u.gender_id = g.id
     LEFT JOIN city c ON u.city_id = c.id
     LEFT JOIN status s ON u.status_id = s.id
     WHERE u.id = ?
     GROUP BY u.id;
   `;

  const [result] = await db.query(finalQuery, [user.id]);
  return result[0];
};

const searchUser = async (target) => {
  if (!target) return [];
  const searchTarget = `%${target.toLowerCase()}%`;

  const searchQuery = `SELECT id FROM users WHERE LOWER(username) LIKE ? OR LOWER(name) LIKE ?`;

  try {
    const [users] = await db.query(searchQuery, [searchTarget, searchTarget]);

    if (users.length === 0) return [];

    //console.log("Raw user IDs from search query:", users);

    // Fetch details and include `id` in each user object
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const details = await fetchUserDetails(user);
        return details ? { id: user.id, ...details } : null; // Include `id` if details exist
      })
    );

    //console.log("User details fetched with IDs:", userDetails);

    return userDetails.filter((user) => user !== null); // Filter out any null values
  } catch (error) {
    console.error("Error in searchUser function:", error);
    return [];
  }
};

const searchPosts = async (target) => {
  if (!target) return [];
  const searchQuery = `
          SELECT 
               p.*, 
               u.name AS name, 
               u.profilePic,
               GROUP_CONCAT(pi.img) AS img,
               (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS totalComments
          FROM posts AS p
          JOIN users AS u ON u.id = p.userId
          LEFT JOIN postimage pi ON (pi.post_id = p.id)
          WHERE LOWER(p.desc) LIKE ? OR LOWER(u.name) LIKE ?
          GROUP BY p.id
          ORDER BY p.createdAt DESC`;

  const searchTarget = `%${target.toLowerCase()}%`; // Format target for case-insensitive search

  try {
    const [postsData] = await db.query(searchQuery, [
      searchTarget,
      searchTarget,
    ]);
    if (postsData.length === 0) {
      return postsData; // No posts found
    }
    // Check if the posts are saved by the logged-in user
    const postIds = postsData.map((post) => post.id);
    const checkSavedQuery = `
               SELECT post_id FROM favoriteposts 
               WHERE post_id IN (${postIds.join(",")})
          `;
    const [savedPostsData] = await db.query(checkSavedQuery);

    // Convert saved posts into a set for easy lookup
    const savedPostIds = new Set(savedPostsData.map((post) => post.post_id));

    // Add 'saved' status to each post
    const postsWithSavedStatus = postsData.map((post) => ({
      ...post,
      saved: savedPostIds.has(post.id), // Check if the post is in the saved posts set
    }));

    return postsWithSavedStatus;
  } catch (error) {
    console.error("Search Posts Error:", error);
    throw new Error("Error fetching posts");
  }
};

const searchShoplistings = async (target) => {
  if (!target) return [];

  const searchTarget = `%${target.toLowerCase()}%`;

  try {
    // Query to fetch the shop listing by shopId
    const shopQuery = `      
          SELECT 
               s.shop_id, 
               s.name, 
               s.description, 
               t.type_name AS type,
               s.location,
               s.postal_code, 
               s.date_established, 
               s.license_number, 
               s.owner_id,
               GROUP_CONCAT(pg.image) AS photo_gallery  
          FROM shoplistings s
          JOIN shoptype t ON s.type_id = t.id
          LEFT JOIN shoplistingphotogallery pg ON pg.shop_id = s.shop_id 
          WHERE 
               LOWER(s.name) LIKE ? 
               OR LOWER(s.description) LIKE ? 
               OR LOWER(t.type_name) LIKE ? 
               OR LOWER(s.location) LIKE ? 
               OR s.postal_code LIKE ?
          GROUP BY s.shop_id`;
    const [shopData] = await db.query(shopQuery, [
      searchTarget,
      searchTarget,
      searchTarget,
      searchTarget,
      searchTarget,
    ]);

    return shopData;
  } catch (error) {
    console.error("Search Shoplisting Error:", error);
    throw new Error("Error fetching shoplistings" + error);
  }
};

const searchEvents = async (target) => {
  if (!target) return [];

  const searchTarget = `%${target.toLowerCase()}%`;

  try {
    const shopQuery = `    
          SELECT 
               e.id, 
               e.title, 
               e.type_id,
               t.type_name,
               e.description,
               e.start_datetime AS start, 
               e.end_datetime AS end, 
               e.capacity,
               (SELECT COUNT(user_id) FROM UserJoinedEvent WHERE event_id = e.id) AS occupied,
               e.price,
               u.username,
               s.name AS shop_name,
               s.shop_id,
               e.created_on
          FROM event e 
          JOIN eventtype t ON e.type_id = t.id
          JOIN users u ON e.owner_id = u.id
          JOIN shoplistings s ON e.shop_id = s.shop_id
          WHERE LOWER(e.title) LIKE ? OR LOWER(t.type_name) LIKE ? OR LOWER(e.description) LIKE ? OR LOWER(s.name) LIKE ?`;

    const [eventData] = await db.query(shopQuery, [
      searchTarget,
      searchTarget,
      searchTarget,
      searchTarget,
    ]);
    return eventData;
  } catch (error) {
    console.error("Search Shoplisting Error:", error);
    throw new Error("Error fetching shoplistings" + error);
  }
};

export const validateUser = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    // Verify token using the secret key from environment variables
    const userInfo = jwt.verify(token, "secretkey");

    // Check if user has admin privileges
    const [rows] = await db.query(
      `SELECT t.type_name 
                 FROM usertype t 
                 JOIN users u ON t.id = u.user_type_id 
                 WHERE u.id = ?`,
      [userInfo.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found!" });
    }
    req.user = userInfo;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid Token!" });
    }
    console.error("Authentication Error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const searchUserOnly = async (req, res) => {
  const { target } = req.query;
  const users = await searchUser(target);
  return res.status(200).json(users);
};
export const searchPostsOnly = async (req, res) => {
  const { target } = req.query;
  const posts = await searchPosts(target);
  return res.status(200).json(posts);
};
export const searchShoplistingsOnly = async (req, res) => {
  const { target } = req.query;
  const shoplistings = await searchShoplistings(target);
  return res.status(200).json(shoplistings);
};
export const searchEventsOnly = async (req, res) => {
  const { target } = req.query;
  const events = await searchEvents(target);
  return res.status(200).json(events);
};

export const searchAll = async (req, res) => {
  const { target } = req.query;

  try {
    const users = await searchUser(target);
    const posts = await searchPosts(target);
    const shoplistings = await searchShoplistings(target);
    const events = await searchEvents(target);

    return res.status(200).json({ users, posts, shoplistings, events });
  } catch (err) {
    if (!res.headersSent) {
      console.log("Search error:", err);
      return res
        .status(500)
        .json({ error: "Server error", details: err.message });
    }
  }
};

// serach expert only...
export const searchExpertOnly = async (req, res) => {
  const { target } = req.query;
  const { id: userId } = req.user; // Retrieve `id` from validated `req.user`

  // Log to verify userId is correctly retrieved
  console.log("Current User ID:", userId);

  if (!target) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    // Define the search target with case-insensitive matching
    const searchTarget = `%${target.toLowerCase()}%`;

    // Query to find users of type 'Expert' that match the search target and exclude the current user
    const searchQuery = `
             SELECT id, username, name 
             FROM users 
             WHERE (LOWER(username) LIKE ? OR LOWER(name) LIKE ?)
               AND user_type_id = (SELECT id FROM UserType WHERE type_name = 'Expert')
               AND id != ? -- Exclude the current user by their ID
         `;

    // Execute query with the search target and the current user ID
    const [users] = await db.query(searchQuery, [
      searchTarget,
      searchTarget,
      userId,
    ]);

    // Log result of users found to verify current user exclusion
    console.log("Users Found:", users);

    // If no users are found, return an empty array
    if (!users || users.length === 0) {
      return res.status(200).json([]); // No experts found
    }

    // Fetch detailed information for each matching user
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const details = await fetchUserDetails(user);
        return details ? { id: user.id, ...details } : null; // Include `id` if details exist
      })
    );

    // Filter out any null values (for users without details)
    const experts = userDetails.filter((user) => user !== null);

    // Return the array of expert user details
    return res.status(200).json(experts);
  } catch (error) {
    console.error("Error in searchExpertOnly:", error);
    return res
      .status(500)
      .json({
        error: "Server error: could not retrieve expert users",
        details: error.message,
      });
  }
};
