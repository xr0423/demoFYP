import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const validateOwner = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Not Logged In!" });
    }

    // Verify token using the secret key from environment variables
    const userInfo = jwt.verify(token, "secretkey");

    // Check if user has admin privileges
    const [rows] = await db.query(
      `SELECT t.type_name 
 FROM userType t 
 JOIN users u ON t.id = u.user_type_id 
 WHERE u.id = ?`,
      [userInfo.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found!" });
    }

    if (rows[0].type_name !== "owner") {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    // Attach user info to the request object for further use
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

export const getShoplistingStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const [result] = await db.query(
      `SELECT t.status_name FROM shoplistings s JOIN Status t ON s.status_id = t.id WHERE s.shop_id = ?`,
      [id]
    );
    return res.status(200).json(result[0].status_name);
  } catch (err) {
    return res.status(500).json("Failed to get shop status");
  }
};

export const getShoplistingRelatedData = async (req, res) => {
  const ShopTypeQuery = `SELECT * FROM shopType ORDER BY id ASC`;
  const ServiceOfferedQuery = `SELECT * FROM serviceoffered ORDER BY id ASC`;
  const DeliveryOptionQuery = `SELECT * FROM deliveryoption ORDER BY id ASC`;
  const DayOfWeekQuery = `SELECT * FROM dayofweek ORDER BY id ASC`;

  try {
    // Check if the user is logged in by verifying the token
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json("Not Logged In!");
    }

    // Verify the token
    const userInfo = jwt.verify(token, "secretkey");

    // Perform all database queries using async/await
    const [shopTypes] = await db.query(ShopTypeQuery);
    const [servicesOffered] = await db.query(ServiceOfferedQuery);
    const [deliveryOptions] = await db.query(DeliveryOptionQuery);
    const [daysOfWeek] = await db.query(DayOfWeekQuery);

    // Combine all the data and return in a single response
    return res.status(200).json({
      shopTypes,
      servicesOffered,
      deliveryOptions,
      daysOfWeek,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }

    // Handle database and server errors
    return res.status(500).json({ error: "Server error", details: err });
  }
};

export const getShopListing = async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : null;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const q = `
      SELECT 
          s.shop_id, 
          s.name,
          s.img,
          s.description, 
          t.type_name AS type,
          s.location,
          s.postal_code, 
          s.date_established, 
          s.license_number, 
          s.owner_id,  
          st.status_name AS status,
          s.created_on,
          s.featured_expire_date,
          -- Check if the shop is featured based on the current date
          CASE 
              WHEN s.featured_expire_date >= CURDATE() THEN true
              ELSE false
          END AS is_featured
      FROM shoplistings s
      JOIN shoptype t ON s.type_id = t.id
      JOIN status st ON s.status_id = st.id
      WHERE s.owner_id = ?
      GROUP BY s.shop_id
      ORDER BY s.created_on DESC;
    `;

    const [data] = await db.query(q, [userId]);

    if (data.length === 0) {
      return res.status(200).json([]);
    }

    // Add document data for each shop
    const documentQuery = `
      SELECT shoplisting_id, name 
      FROM document 
      WHERE shoplisting_id IN (?)`;

    const shopIds = data.map((shop) => shop.shop_id);
    const [documents] = await db.query(documentQuery, [shopIds]);

    const shopDataWithDocuments = data.map((shop) => ({
      ...shop,
      documents: documents
        .filter((doc) => doc.shoplisting_id === shop.shop_id)
        .map((doc) => doc.name),
    }));

    return res.status(200).json(shopDataWithDocuments);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// Get shop listing by shop ID
export const getShopListingByShopId = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const shopId = req.params.shopId ? parseInt(req.params.shopId) : null;
    if (shopId === null) {
      return res.status(403).json("Please provide a shop ID");
    }
    console.log(shopId);

    const shopQuery = `
      SELECT 
        s.shop_id, 
        s.name,
        s.img,
        s.description, 
        t.type_name AS type,
        s.type_id,
        s.location,
        s.postal_code, 
        s.date_established, 
        s.license_number, 
        s.owner_id,  
        st.status_name AS status
      FROM 
        shoplistings s
      JOIN 
        shoptype t ON s.type_id = t.id
      JOIN 
        status st ON s.status_id = st.id
      WHERE 
        shop_id = ?`;

    const [shopData] = await db.query(shopQuery, [shopId]);

    if (shopData.length === 0) {
      return res.status(404).json({ message: "This is an invalid shop ID" });
    }

    const serviceQuery = `
      SELECT s.service_name 
      FROM shoplistingservice sls
      JOIN serviceoffered s ON sls.service_id = s.id
      WHERE sls.shop_id = ?`;
    const [servicesOffered] = await db.query(serviceQuery, [shopId]);

    const deliveryOptionQuery = `
      SELECT do.option_name 
      FROM shoplistingdeliveryoption sldo
      JOIN deliveryoption do ON sldo.delivery_option_id = do.id
      WHERE sldo.shop_id = ?`;
    const [deliveryOptions] = await db.query(deliveryOptionQuery, [shopId]);

    const closedDaysQuery = `
      SELECT d.day_name 
      FROM shoplistingcloseddays slcd
      JOIN dayofweek d ON slcd.day_id = d.id
      WHERE slcd.shop_id = ?`;
    const [closedDays] = await db.query(closedDaysQuery, [shopId]);

    // Fetch the documents for this shop
    const documentQuery = `
      SELECT name 
      FROM document 
      WHERE shoplisting_id = ?`;
    const [documents] = await db.query(documentQuery, [shopId]);

    // Return the complete shop listing details with all related data
    return res.status(200).json({
      shopData: shopData[0],
      servicesOffered: servicesOffered.map((service) => service.service_name),
      deliveryOptions: deliveryOptions.map((option) => option.option_name),
      closedDays: closedDays.map((day) => day.day_name),
      documents: documents.map((doc) => doc.name), // Include documents
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const createShopListing = async (req, res) => {
  const {
    name,
    description,
    type,
    location,
    postal_code,
    closed_on,
    date_established,
    license_number,
    services_offered,
    delivery_options,
    img, // Received photo URLs from frontend
    documents, // Received document URLs from frontend
  } = req.body;

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      // Check if shop listing already exists for this owner with the same location
      const q = `SELECT * FROM shoplistings WHERE LOWER(location) = LOWER(?) AND owner_id = ?`;
      const [data] = await db.query(q, [location, userInfo.id]);

      if (data.length) {
        return res
          .status(409)
          .json("Shop listing with this location already exists for the owner");
      }

      // Insert into ShopListings
      const shopListingInsertQuery = `
          INSERT INTO shoplistings (name, description, img, type_id, location, postal_code, date_established, license_number, owner_id, status_id) 
          VALUES (?, ?, ?, (SELECT id FROM shoptype WHERE type_name = ?), ?, ?, ?, ?, ?, (SELECT id FROM status WHERE status_name = 'pending'))
        `;

      const [shopResult] = await db.query(shopListingInsertQuery, [
        name,
        description,
        img,
        type,
        location,
        postal_code,
        date_established,
        license_number,
        userInfo.id,
      ]);

      const shopId = shopResult.insertId;

      // Insert uploaded documents into the Document table
      if (documents && documents.length > 0) {
        const documentInsertPromises = documents.map((docUrl) => {
          const query = `
              INSERT INTO document (name, user_id, shoplisting_id) 
              VALUES (?, ?, ?)
            `;
          return db.query(query, [docUrl, userInfo.id, shopId]);
        });
        await Promise.all(documentInsertPromises);
      }

      // Insert services offered, social media, delivery options, and closed days
      await insertManyToManyData(
        shopId,
        services_offered,
        delivery_options,
        closed_on
      );

      // Notify all followers
      const followersQuery = `
        SELECT followerUserId 
        FROM Relationships 
        WHERE followedUserId = ?
      `;
      const [followers] = await db.query(followersQuery, [userInfo.id]);

      if (followers.length > 0) {
        const notificationQuery = `
          INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`shop_id\`)
          VALUES (?, ?, ?, ?)
        `;
        const notificationPromises = followers.map((follower) =>
          db.query(notificationQuery, [
            follower.followerUserId, // Recipient (follower of the user)
            userInfo.id, // Sender (user creating the shop listing)
            "create listing", // Notification type
            shopId, // ID of the created shop listing
          ])
        );
        await Promise.all(notificationPromises);
      }

      return res.status(201).json({
        message: "Shop listing created successfully, followers notified",
      });
    });
  } catch (err) {
    console.error("Error creating shop listing:", err);
    return res
      .status(500)
      .json({ error: "Error creating shop listing", details: err });
  }
};

// Helper function to insert many-to-many relationships
const insertManyToManyData = async (
  shopId,
  services,
  deliveryOptions,
  closedDays
) => {
  const insertPromises = [];

  // Services offered
  if (services.length > 0) {
    services.forEach((service_name) => {
      const query = `INSERT INTO shoplistingservice (shop_id, service_id) VALUES (?, (SELECT id FROM serviceoffered WHERE service_name = ?))`;
      insertPromises.push(db.query(query, [shopId, service_name]));
    });
  }

  // Delivery options
  if (deliveryOptions.length > 0) {
    deliveryOptions.forEach((option_name) => {
      const query = `INSERT INTO shopListingdeliveryoption (shop_id, delivery_option_id) VALUES (?, (SELECT id FROM deliveryoption WHERE option_name = ?))`;
      insertPromises.push(db.query(query, [shopId, option_name]));
    });
  }

  // Closed days
  if (closedDays.length > 0) {
    closedDays.forEach((day_name) => {
      const query = `INSERT INTO shoplistingcloseddays (shop_id, day_id) VALUES (?, (SELECT id FROM dayofweek WHERE day_name = ?))`;
      insertPromises.push(db.query(query, [shopId, day_name]));
    });
  }

  await Promise.all(insertPromises);
};

// Update an existing shop listing
export const updateShopListing = async (req, res) => {
  const {
    name,
    description,
    type,
    location,
    postal_code,
    closed_on,
    date_established,
    license_number,
    services_offered,
    delivery_options,
    photo, // Add photo to the destructured data
  } = req.body;
  const shopId = req.params.shopId;

  try {
    // Check if the user is logged in by verifying the token
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    // Fetch the current status of the shop listing
    const currentStatusQuery = `SELECT status_id FROM shoplistings WHERE shop_id = ?`;
    const [currentStatusResult] = await db.query(currentStatusQuery, [shopId]);
    const currentStatusId = currentStatusResult[0].status_id;

    // If the current status is "suspended", change it to "pending"
    let newStatusId = currentStatusId;

    // Fetch the status ID for "pending" from the Status table
    if (currentStatusId === (await getStatusIdByName("suspended"))) {
      newStatusId = await getStatusIdByName("pending");
    }

    // Update the primary shop listing information
    const updateShopQuery = `
      UPDATE shoplistings 
      SET name = ?, description = ?, type_id = (SELECT id FROM shopType WHERE type_name = ?), location = ?, postal_code = ?, date_established = ?, license_number = ?, img = ?, status_id = ? 
      WHERE shop_id = ? AND owner_id = ?`;

    await db.query(updateShopQuery, [
      name,
      description,
      type,
      location,
      postal_code,
      date_established,
      license_number,
      photo, // Include photo in the query
      newStatusId, // Use the new status ID
      shopId,
      userInfo.id,
    ]);

    // For each of the many-to-many tables, delete old records and insert new ones
    // 1. ShopListingClosedDays
    await db.query("DELETE FROM shopListingcloseddays WHERE shop_id = ?", [
      shopId,
    ]);
    if (closed_on.length > 0) {
      const closedDaysInsertPromises = closed_on.map((day_name) => {
        const query = `INSERT INTO shoplistingclosedsays (shop_id, day_id) VALUES (?, (SELECT id FROM dayoffweek WHERE day_name = ?))`;
        return db.query(query, [shopId, day_name]);
      });
      await Promise.all(closedDaysInsertPromises);
    }

    // 2. ShopListingService
    await db.query("DELETE FROM shopListingservice WHERE shop_id = ?", [
      shopId,
    ]);
    if (services_offered.length > 0) {
      const serviceInsertPromises = services_offered.map((service_name) => {
        const query = `INSERT INTO shopListingservice (shop_id, service_id) VALUES (?, (SELECT id FROM serviceoffered WHERE service_name = ?))`;
        return db.query(query, [shopId, service_name]);
      });
      await Promise.all(serviceInsertPromises);
    }

    // 4. ShopListingDeliveryOption
    await db.query("DELETE FROM shopListingdeliveryoption WHERE shop_id = ?", [
      shopId,
    ]);
    if (delivery_options.length > 0) {
      const deliveryInsertPromises = delivery_options.map((option_name) => {
        const query = `INSERT INTO shoplistingdeliveryoption (shop_id, delivery_option_id) VALUES (?, (SELECT id FROM deliveryoption WHERE option_name = ?))`;
        return db.query(query, [shopId, option_name]);
      });
      await Promise.all(deliveryInsertPromises);
    }

    return res
      .status(200)
      .json({ message: "Shop listing updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// Helper function to get the status ID by status name
const getStatusIdByName = async (statusName) => {
  const query = `SELECT id FROM status WHERE status_name = ?`;
  const [result] = await db.query(query, [statusName]);
  return result[0].id;
};

// Delete a shop listing
export const deleteShopListing = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const shopId = req.params.shopId; // Get shopId from the path
    if (!shopId) {
      return res.status(400).json("Shop ID is required");
    }

    // Check if the shop listing belongs to the authenticated user
    const q = `SELECT * FROM shoplistings WHERE shop_id = ? AND owner_id = ?`;
    const [shop] = await db.query(q, [shopId, userInfo.id]);

    if (shop.length === 0) {
      return res
        .status(403)
        .json("You do not have permission to delete this shop listing");
    }

    // Proceed with deletion
    const deleteQuery = `DELETE FROM shoplistings WHERE shop_id = ? AND owner_id = ?`;
    await db.query(deleteQuery, [shopId, userInfo.id]);

    return res.status(200).json("Shop listing deleted successfully");
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// Get all shop listings
export const getAllShopListing = async (req, res) => {
  const q = `
    SELECT 
      s.shop_id, 
      s.name,
      s.img,
      s.description, 
      t.type_name AS type,
      s.location,
      s.postal_code, 
      s.date_established, 
      s.license_number, 
      s.owner_id,  
      st.status_name AS status,
      COALESCE(AVG(r.rating), 0) AS rating,
      s.created_on
    FROM 
      shoplistings s
    JOIN 
      shoptype t ON s.type_id = t.id
    JOIN 
      status st ON s.status_id = st.id
    LEFT JOIN 
      shopreviews r ON r.shop_id = s.shop_id
    WHERE st.status_name = 'active'
    GROUP BY 
      s.shop_id
    ORDER BY 
      s.created_on DESC
  `;

  try {
    const [data] = await db.query(q); // Execute the query
    console.log(data); // Log the data for debugging purposes
    return res.status(200).json(data); // Return the data
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getShopName = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged IN!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    console.log(userInfo.id);
    const [typeresult] = await db.query(
      `Select t.type_name FROM usertype t JOIN users u ON u.user_type_id = t.id WHERE u.id = ?`,
      [userInfo.id]
    );
    const typename = typeresult[0].type_name;
    let q = ``;
    let [data] = [];
    if (typename === "owner") {
      q = `
      SELECT 
            s.shop_id, 
            s.name,
            s.owner_id,  
            st.status_name AS status
          FROM 
            shoplistings s
          JOIN 
            status st ON s.status_id = st.id
      WHERE st.status_name = 'active'
      AND s.owner_id = ?
      GROUP BY 
        s.shop_id;  
    `;
      data = await db.query(q, [userInfo.id]);
    } else {
      q = `
      SELECT 
            s.shop_id, 
            s.name,
            s.owner_id,  
            st.status_name AS status
          FROM 
            shoplistings s
          JOIN 
            status st ON s.status_id = st.id
      WHERE st.status_name = 'active'
      GROUP BY 
        s.shop_id;  
    `;
      data = await db.query(q);
    } // Using promise-based query
    return res.status(200).json(data[0]); // Send the data back to the client
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

export const getHighlightedShops = async (req, res) => {
  // Query to get the latest shops created within the last month
  const latestShopsQuery = `
    SELECT 
        s.shop_id, 
        s.name,
        s.img,
        s.description, 
        t.type_name AS type,
        s.location,
        s.postal_code, 
        s.date_established, 
        s.license_number, 
        s.owner_id,  
        st.status_name AS status,
        COALESCE(AVG(r.rating), 0) AS rating,
        COUNT(r.review_id) AS reviewCount
    FROM shoplistings s
    JOIN shoptype t ON s.type_id = t.id
    JOIN status st ON s.status_id = st.id
    LEFT JOIN shopreviews r ON r.shop_id = s.shop_id
    WHERE st.status_name = 'active' AND s.created_on >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY s.shop_id
    ORDER BY s.created_on DESC
  `;

  // Query to get the top-rated active shop
  const topRatedShopQuery = ` 
      SELECT 
          s.shop_id, 
          s.name,
          s.img,
          s.description, 
          t.type_name AS type,
          s.location,
          s.postal_code, 
          s.date_established, 
          s.license_number, 
          s.owner_id,  
          st.status_name AS status,
          COALESCE(AVG(r.rating), 0) AS rating,
          COUNT(r.review_id) AS reviewCount
      FROM shoplistings s
      JOIN shoptype t ON s.type_id = t.id
      JOIN status st ON s.status_id = st.id
      LEFT JOIN shopreviews r ON r.shop_id = s.shop_id
      WHERE st.status_name = 'active'
      GROUP BY s.shop_id
      HAVING rating >= 3.5
      ORDER BY rating DESC;
  `;

  // Query to get shops that are featured based on the current date
  const featuredShopsQuery = `
    SELECT 
        s.shop_id, 
        s.name,
        s.img,
        s.description, 
        t.type_name AS type,
        s.location,
        s.postal_code, 
        s.date_established, 
        s.license_number, 
        s.owner_id,  
        st.status_name AS status,
        COALESCE(AVG(r.rating), 0) AS rating,
        COUNT(r.review_id) AS reviewCount
    FROM shoplistings s
    JOIN shoptype t ON s.type_id = t.id
    JOIN status st ON s.status_id = st.id
    LEFT JOIN shopreviews r ON r.shop_id = s.shop_id
    WHERE st.status_name = 'active' AND s.featured_expire_date >= CURDATE()
    GROUP BY s.shop_id
    ORDER BY s.featured_expire_date DESC
  `;

  try {
    // Execute all queries in parallel for efficiency
    const [[latestShops], [topRatedShops], [featuredShops]] = await Promise.all(
      [
        db.query(latestShopsQuery),
        db.query(topRatedShopQuery),
        db.query(featuredShopsQuery),
      ]
    );

    return res.status(200).json({
      featuredShops: featuredShops || [],
      latestShops: latestShops || [],
      topRatedShops: topRatedShops || [],
    });
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// Get all favorite shops for a user
export const getFavoriteShops = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const q = `SELECT shop_id FROM favoriteShops WHERE user_id = ?`;
    const [favorites] = await db.query(q, [userInfo.id]);

    const favoriteShopIds = favorites.map((fav) => fav.shop_id);
    res.status(200).json(favoriteShopIds);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch favorite shops", details: err });
  }
};

// Add a shop to favorites
export const addFavoriteShop = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey"); // Decode user info from the token
    const { shop_id } = req.body; // Extract shop ID from request body

    // Step 1: Add the shop to favorites
    const q = `INSERT INTO favoriteshops (user_id, shop_id) VALUES (?, ?)`;
    await db.query(q, [userInfo.id, shop_id]);

    // Step 2: Fetch the shop owner ID from the `shoplistings` table
    const ownerQuery = `SELECT owner_id FROM shoplistings WHERE shop_id = ?`;
    const [ownerResult] = await db.query(ownerQuery, [shop_id]);

    // Step 3: Notify the shop owner if they exist
    if (ownerResult.length > 0) {
      const ownerId = ownerResult[0].owner_id;

      const notificationQuery = `
        INSERT INTO allnotification (\`receiver\`, \`from_id\`, \`type\`, \`shop_id\`)
        VALUES (?, ?, ?, ?)
      `;
      await db.query(notificationQuery, [
        ownerId, // Notify the shop owner
        userInfo.id, // The user who favorited the shop
        "save shop", // Notification type
        shop_id, // Reference to the shop
      ]);
    }

    // Step 4: Respond to the client
    res.status(200).json("Shop added to favorites and owner notified.");
  } catch (err) {
    console.error("Error adding favorite shop:", err); // Log the error
    res
      .status(500)
      .json({ error: "Failed to add favorite shop", details: err.message });
  }
};

// Remove a shop from favorites
export const removeFavoriteShop = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not Logged In!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    const { shop_id } = req.body;

    const q = `DELETE FROM favoriteshops WHERE user_id = ? AND shop_id = ?`;
    await db.query(q, [userInfo.id, shop_id]);

    res.status(200).json("Shop removed from favorites");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to remove favorite shop", details: err });
  }
};

// ============== Menu Item =============================

export const getMenuItemRelatedData = async (req, res) => {
  const itemCategoryQuery = `SELECT * FROM menuitemcategory`;
  const dietaryRestrictionQuery = `SELECT * FROM dietaryrestriction`;

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    // Verify the token
    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    const [itemCategory] = await db.query(itemCategoryQuery);
    const [dietaryRestriction] = await db.query(dietaryRestrictionQuery);

    return res.status(200).json({
      itemCategory,
      dietaryRestriction,
    });
  } catch (err) {
    // Handle token errors or database errors
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getMenuItem = async (req, res) => {
  try {
    // Check if the user is logged in by verifying the token
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    // Verify the token
    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    // Base SQL Query to get menu items
    let q = `
      SELECT 
        m.id, 
        m.name, 
        m.desc, 
        m.img, 
        c.id AS category_id, 
        c.category_name, 
        m.usual_price, 
        m.discounted_rate, 
        m.availability,
        m.special,
        m.shop_id,
        GROUP_CONCAT(DISTINCT dr.restriction_name) AS dietary_restriction
      FROM menuitem m 
      JOIN menuitemcategory c ON m.category_id = c.id
      LEFT JOIN menuitemdietaryrestriction mir ON mir.menuitem_id = m.id
      LEFT JOIN dietaryrestriction dr ON dr.id = mir.restriction_id
    `;

    // Get the shopId or id from query params
    const { shopId, id } = req.query;
    let queryParams = [];
    let whereConditions = [];

    // Add shopId condition if available
    if (shopId) {
      whereConditions.push("m.shop_id = ?");
      queryParams.push(shopId);
    }

    // Add id condition if available
    if (id) {
      whereConditions.push("m.id = ?");
      queryParams.push(id);
    }

    // If there are any conditions, add WHERE clause
    if (whereConditions.length > 0) {
      q += `WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add GROUP BY clause to the query
    q += ` GROUP BY m.id`;

    // Execute the query using the provided parameters
    const [menuItems] = await db.query(q, queryParams);

    // If no menu items found, return a 404 response
    if (menuItems.length === 0) {
      return res.status(200).json([]);
    }

    // Return the menu items as the response
    return res.status(200).json(menuItems);
  } catch (err) {
    // Handle token errors or database errors
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const createMenuItem = async (req, res) => {
  const insertMenuItemQuery = `INSERT INTO menuitem 
  (name, \`desc\`, img, category_id, usual_price, discounted_rate, availability, special, shop_id) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Insert into MenuItemDietaryRestriction
  const insertMenuItemDietaryRestrictionQuery = `
    INSERT INTO menuitemDietaryrestriction (restriction_id, menuitem_id)
    VALUES (?, ?)
  `;

  const selectDietaryRestrictionQuery = `
    SELECT id FROM dietaryrestriction WHERE restriction_name = ?
  `;

  const {
    name,
    desc,
    img,
    category_id,
    usual_price,
    discounted_rate,
    availability,
    special,
    shop_id,
    dietary_restrictions,
  } = req.body;

  try {
    // Check if the user is logged in by verifying the token
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    // Verify the token
    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    // insert menu item
    const [menuItemResult] = await db.query(insertMenuItemQuery, [
      name,
      desc,
      img,
      category_id,
      usual_price,
      discounted_rate,
      availability,
      special,
      shop_id,
    ]);

    // // insert dietary restriction

    const menuItemId = menuItemResult.insertId;

    if (dietary_restrictions.length > 0) {
      const dietaryRestrictionPromises = dietary_restrictions.map(
        async (restriction_name) => {
          const [restrictionResult] = await db.query(
            selectDietaryRestrictionQuery,
            [restriction_name]
          );
          if (restrictionResult.length > 0) {
            const restrictionId = restrictionResult[0].id;
            console.log(menuItemId, restrictionId);
            return db.query(insertMenuItemDietaryRestrictionQuery, [
              restrictionId,
              menuItemId,
            ]);
          }
        }
      );
      await Promise.all(dietaryRestrictionPromises);
    }

    return res.status(200).json("Created Successfully");
  } catch (err) {
    // Handle token errors or database errors
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.log(err.message);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  const validateMenuItemQuery = `
    SELECT m.name, m.shop_id, s.owner_id
    FROM menuitem m
    JOIN shoplistings s ON m.shop_id = s.shop_id
    WHERE m.id = ? AND s.owner_id = ?
    GROUP BY m.id
  `;

  const deleteQuery = `DELETE FROM menuitem WHERE id = ?`;
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    const { item_id } = req.query;

    if (!item_id) {
      return res.status(401).json("Invalid request parameters!");
    }

    const [validateResult] = await db.query(validateMenuItemQuery, [
      item_id,
      userInfo.id,
    ]);
    if (validateResult.length > 0) {
      await db.query(deleteQuery, [item_id]);
      return res.status(200).json("Menu item deleted successfully.");
    } else {
      return res.status(404).json("Menu item not found or not authorized.");
    }
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Server Error:", err.message);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  const validateMenuItemQuery = `
  SELECT m.name, m.shop_id, s.owner_id
  FROM menuitem m
  JOIN shoplistings s ON m.shop_id = s.shop_id
  WHERE m.id = ? AND s.owner_id = ?
  GROUP BY m.id
`;

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    const { item_id } = req.query;

    // get updated data
    const {
      name,
      desc,
      img,
      category_id,
      usual_price,
      discounted_rate,
      availability,
      special,
      dietary_restrictions,
    } = req.body;

    const updateQuery = `UPDATE menuitem 
  SET name = ?, \`desc\` = ? , img = ? , category_id = ?, usual_price = ?, discounted_rate = ?, availability = ?, special = ?
  WHERE id = ?`;
    const clearPreviousRestrictionData = `DELETE FROM menuItemdietaryrestriction WHERE menuitem_id = ?`;

    // Insert into MenuItemDietaryRestriction
    const insertMenuItemDietaryRestrictionQuery = `
  INSERT INTO menuitemdietaryrestriction (restriction_id, menuitem_id)
  VALUES (?, ?)
  `;

    const selectDietaryRestrictionQuery = `
    SELECT id FROM dietaryrestriction WHERE restriction_name = ?
  `;

    if (!item_id) {
      return res.status(401).json("Invalid request parameters!");
    }

    const [validateResult] = await db.query(validateMenuItemQuery, [
      item_id,
      userInfo.id,
    ]);
    if (validateResult.length > 0) {
      // update start from here
      await db.query(updateQuery, [
        name,
        desc,
        img,
        category_id,
        usual_price,
        discounted_rate,
        availability,
        special,
        item_id,
      ]);
      await db.query(clearPreviousRestrictionData, [item_id]);
      if (dietary_restrictions.length > 0) {
        const dietaryRestrictionPromises = dietary_restrictions.map(
          async (restriction_name) => {
            const [restrictionResult] = await db.query(
              selectDietaryRestrictionQuery,
              [restriction_name]
            );
            if (restrictionResult.length > 0) {
              const restrictionId = restrictionResult[0].id;
              return db.query(insertMenuItemDietaryRestrictionQuery, [
                restrictionId,
                item_id,
              ]);
            }
          }
        );
        await Promise.all(dietaryRestrictionPromises);
      }
      return res.status(200).json("Menu item deleted successfully.");
    } else {
      return res.status(404).json("Menu item not found or not authorized.");
    }
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json("Token is not valid!");
    }
    console.error("Server Error:", err.message);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
// =================== Gallery ============================
export const getGallery = async (req, res) => {
  const { shopId } = req.query;
  // const shopId = 10;
  if (!shopId) return res.status(404).json("Shop Id is required");
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = await new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    const [isShopExists] = await db.query(
      `SELECT * FROM shoplistings WHERE shop_id = ?`,
      [shopId]
    );
    if (!isShopExists[0])
      return res.status(404).json({ message: "Shop not found!" });

    const query = `SELECT * FROM shoplistingphotogallery WHERE shop_id = ?`;
    const [result] = await db.query(query, [shopId]);

    return res.status(200).json(result);
  } catch (err) {}
};

// Upload Gallery Images (multiple)
export const uploadGallery = async (req, res) => {
  const { shopId, imgs } = req.body;

  if (!shopId || !imgs || imgs.length === 0) {
    return res.status(400).json("Shop ID and image files are required");
  }

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const insertQuery = `INSERT INTO shoplistingphotogallery (shop_id, image) VALUES (?, ?)`;

    const insertPromises = imgs.map((img) =>
      db.query(insertQuery, [shopId, img])
    );
    await Promise.all(insertPromises);

    return res.status(201).json("Images uploaded successfully");
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
};

// Delete Gallery Image
export const deleteGallery = async (req, res) => {
  const { imageId } = req.query;
  if (!imageId) return res.status(400).json("Image ID is required");

  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not Logged IN!");

    const userInfo = jwt.verify(token, "secretkey");

    const deleteQuery = `DELETE FROM shoplistingphotogallery WHERE id = ?`;
    const [result] = await db.query(deleteQuery, [imageId]);

    if (result.affectedRows === 0)
      return res.status(404).json("Image not found");

    return res.status(200).json("Image deleted successfully");
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
};

//==================Rewards

// Get rewards for a shop
export const getRewards = async (req, res) => {
  try {
    const shopId = req.query.shopId;
    const q = "SELECT * FROM vouchers WHERE shop_id = ? AND is_active = TRUE";
    const [data] = await db.query(q, [shopId]);
    if (data.length === 0) {
      return res.status(404).json({ message: "No vouchers available" });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// Create reward
export const createReward = async (req, res) => {
  const {
    shopId,
    voucher_name,
    amount_available,
    points_cost,
    value_in_dollars,
    validity_period,
    img = "default-empty.jpg",
    exclusive,
    description,
    tnc,
  } = req.body;

  // Ensure all required fields are provided
  if (
    !shopId ||
    !voucher_name ||
    !amount_available ||
    !points_cost ||
    !value_in_dollars ||
    !validity_period
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = `
      INSERT INTO vouchers (shop_id, voucher_name, img, amount_available, points_cost, value_in_dollars, validity_period, is_active, exclusive, description, tnc) 
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)
    `;

  try {
    const [result] = await db.query(q, [
      shopId,
      voucher_name,
      img, // Store image path in database
      amount_available,
      points_cost,
      value_in_dollars,
      validity_period,
      exclusive,
      description,
      tnc,
    ]);
    return res.status(201).json("Voucher created successfully");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// Delete reward
export const deleteReward = async (req, res) => {
  const rewardId = req.query.rewardId;

  const q = "DELETE FROM vouchers WHERE voucher_id = ?";
  try {
    await db.query(q, [rewardId]);
    return res.status(200).json("Voucher deleted successfully");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// Update reward
export const updateReward = async (req, res) => {
  const rewardId = req.query.rewardId;
  const {
    voucher_name,
    img, // Added img field
    amount_available,
    points_cost,
    value_in_dollars,
    validity_period,
    exclusive,
    description,
    tnc,
  } = req.body;

  const q = `
      UPDATE vouchers 
      SET voucher_name = ?, img = ?, amount_available = ?, points_cost = ?, value_in_dollars = ?, validity_period = ?, exclusive = ?, description = ?, tnc =?
      WHERE voucher_id = ?
    `;

  try {
    await db.query(q, [
      voucher_name,
      img, // Added img to the query
      amount_available,
      points_cost,
      value_in_dollars,
      validity_period,
      exclusive,
      description,
      tnc,
      rewardId,
    ]);
    return res.status(200).json("Voucher updated successfully");
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// Get reward details by rewardId
export const getRewardDetails = async (req, res) => {
  const rewardId = req.query.rewardId;

  if (!rewardId) {
    return res.status(400).json({ error: "Reward ID is required" });
  }

  const q = "SELECT * FROM vouchers WHERE voucher_id = ?";

  try {
    const [data] = await db.query(q, [rewardId]);

    if (data.length === 0) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    return res.status(200).json(data[0]); // Return the first (and only) row
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const featureShop = async (req, res) => {
  try {
    const coinsNeeded = 10;
    const { id } = req.params;
    const { action } = req.body; // Get the action from the request body
    console.log(id, action);

    // Fetch the current coins and featured status of the shop owner
    const [response] = await db.query(
      `SELECT coins FROM shopowners WHERE id = ?`,
      [req.user.id]
    );
    if (!response.length) {
      return res.status(404).json("Shop owner not found.");
    }
    const currentCoins = response[0].coins;

    // Handle different actions
    if (action === "feature") {
      if (currentCoins < coinsNeeded) {
        return res.status(400).json("Not enough coins.");
      }

      // Deduct coins and feature the shop
      const [deductResult] = await db.query(
        `UPDATE shopowners SET coins = coins - ? WHERE id = ?`,
        [coinsNeeded, req.user.id]
      );
      if (!deductResult.affectedRows) {
        return res.status(500).json("Failed to deduct coins.");
      }

      const expirationDate = moment().add(14, "days").format("YYYY-MM-DD");
      const [updateResult] = await db.query(
        `UPDATE shoplistings SET featured = 1, featured_expire_date = ? WHERE shop_id = ?`,
        [expirationDate, id]
      );
      if (!updateResult.affectedRows) {
        return res.status(500).json("Failed to feature shop.");
      }
      return res.status(200).json("Shop featured successfully.");
    } else if (action === "unfeature") {
      // Unfeature the shop
      const [unfeatureResult] = await db.query(
        `UPDATE shoplistings SET featured = 0, featured_expire_date = NULL WHERE shop_id = ?`,
        [id]
      );
      if (!unfeatureResult.affectedRows) {
        return res.status(500).json("Failed to unfeature shop.");
      }
      return res.status(200).json("Shop unfeatured successfully.");
    } else if (action === "extend") {
      // Extend the feature period by 14 days
      const newExpirationDate = moment(req.body.currentExpireDate)
        .add(14, "days")
        .format("YYYY-MM-DD");
      const [extendResult] = await db.query(
        `UPDATE shoplistings SET featured_expire_date = ? WHERE shop_id = ?`,
        [newExpirationDate, id]
      );
      if (!extendResult.affectedRows) {
        return res.status(500).json("Failed to extend feature period.");
      }
      return res.status(200).json("Feature period extended successfully.");
    } else {
      return res.status(400).json("Invalid action.");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Failed to process feature toggle.");
  }
};

export const getOwnerByShopId = async (req, res) => {
  try {
    const shopId = req.query.shopId; // Extract shopId from query parameters

    if (!shopId) {
      return res.status(400).json({ error: "shopId is required" });
    }

    const query = `
      SELECT 
        u.name, 
        u.id, 
        u.username 
      FROM 
        users u
      JOIN 
        shoplistings s
      ON 
        s.owner_id = u.id
      WHERE 
        s.shop_id = ?;
    `;

    const [data] = await db.query(query, [shopId]); // Assuming you're using `mysql2`

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "No owner found for the given shopId" });
    }

    return res.status(200).json(data[0]); // Return the first owner since shopId is unique
  } catch (err) {
    console.error("Error fetching owner by shopId:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
