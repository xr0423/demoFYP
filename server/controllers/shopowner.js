// metrics
import { pool, db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getOverviewMetrics = async (req, res) => {
  const { ownerId, startDate, endDate } = req.query;
  try {
    // Validate ownerId
    if (!ownerId) {
      return res.status(400).json({ message: "Missing ownerId parameter." });
    }

    // TotalShoplistingsManaged
    const [totalShopsResult] = await pool.query(
      `SELECT COUNT(*) AS totalShopsManaged FROM shoplistings WHERE owner_id = ?`,
      [ownerId]
    );
    const totalShopsManaged = totalShopsResult[0].totalShopsManaged;
    console.log("Total Shop Managed: " + totalShopsManaged);

    // Aggregate Average Rating
    const [aggregateRatingResult] = await pool.query(
      `SELECT AVG(rating) AS aggregateAverageRating 
               FROM shopreviews r
               JOIN shoplistings s ON r.shop_id = s.shop_id
               WHERE s.owner_id = ?`,
      [ownerId]
    );
    const aggregateAverageRating = parseFloat(
      aggregateRatingResult[0].aggregateAverageRating || 0
    ).toFixed(2);
    console.log("Aggregate Average Rating: " + aggregateAverageRating);
    // Total Reviews Across All Shops
    const [totalReviewsResult] = await pool.query(
      `SELECT COUNT(*) AS totalReviews 
               FROM shopreviews r
               JOIN shoplistings s ON r.shop_id = s.shop_id
               WHERE s.owner_id = ?`,
      [ownerId]
    );
    const totalReviews = totalReviewsResult[0].totalReviews;

    // Total Favorites Across All Shops
    const [totalFavoritesResult] = await pool.query(
      `SELECT COUNT(*) AS totalFavorites 
               FROM favoriteshops f
               JOIN shoplistings s ON f.shop_id = s.shop_id
               WHERE s.owner_id = ?`,
      [ownerId]
    );
    const totalFavorites = totalFavoritesResult[0].totalFavorites;
    console.log("Total Favorites: " + totalFavorites);

    // Monthly Trends
    // Define date range
    let dateFilter = "";
    const params = [ownerId];
    if (startDate && endDate) {
      dateFilter = `AND r.created_at BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = `AND r.created_at >= ?`;
      params.push(startDate);
    } else if (endDate) {
      dateFilter = `AND r.created_at <= ?`;
      params.push(endDate);
    }

    // Reviews Trend
    const [reviewsTrend] = await pool.query(
      `SELECT DATE_FORMAT(r.created_at, '%Y-%m') AS month, COUNT(*) AS count
               FROM shopreviews r
               JOIN shoplistings s ON r.shop_id = s.shop_id
               WHERE s.owner_id = ? ${dateFilter}
               GROUP BY month
               ORDER BY month ASC`,
      params
    );

    // Ratings Trend
    const [ratingsTrend] = await pool.query(
      `SELECT DATE_FORMAT(r.created_at, '%Y-%m') AS month, AVG(r.rating) AS averageRating
               FROM shopreviews r
               JOIN shoplistings s ON r.shop_id = s.shop_id
               WHERE s.owner_id = ? ${dateFilter}
               GROUP BY month
               ORDER BY month ASC`,
      params
    );

    // Favorites Trend
    // Adjust the date filter for Favorites if different from Reviews
    let favoritesDateFilter = "";
    const favoritesParams = [ownerId];
    if (startDate && endDate) {
      favoritesDateFilter = `AND f.createdAt BETWEEN ? AND ?`;
      favoritesParams.push(startDate, endDate);
    } else if (startDate) {
      favoritesDateFilter = `AND f.createdAt >= ?`;
      favoritesParams.push(startDate);
    } else if (endDate) {
      favoritesDateFilter = `AND f.createdAt <= ?`;
      favoritesParams.push(endDate);
    }

    const [favoritesTrend] = await pool.query(
      `SELECT DATE_FORMAT(f.createdAt, '%Y-%m') AS month, COUNT(*) AS count
               FROM favoriteshops f
               JOIN shoplistings s ON f.shop_id = s.shop_id
               WHERE s.owner_id = ? ${favoritesDateFilter}
               GROUP BY month
               ORDER BY month ASC`,
      favoritesParams
    );

    res.status(200).json({
      totalShopsManaged,
      aggregateAverageRating,
      totalReviews,
      totalFavorites,
      monthlyTrends: {
        reviews: reviewsTrend,
        ratings: ratingsTrend,
        favorites: favoritesTrend,
      },
    });
  } catch (err) {
    console.error("getOverviewMetrics Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};

export const getShopPerformanceComparison = async (req, res) => {
  const { ownerId } = req.query;

  try {
    if (!ownerId) {
      return res.status(400).json({ message: "Missing ownerId parameter." });
    }

    // Highest-Rated Shop
    const [highestRatedShopResult] = await db.query(
      `SELECT s.shop_id AS shopId, s.name AS shopName, AVG(r.rating) AS averageRating
              FROM shoplistings s
              JOIN shopreviews r ON s.shop_id = r.shop_id
              WHERE s.owner_id = ?
              GROUP BY s.shop_id
              ORDER BY averageRating DESC
              LIMIT 1`,
      [ownerId]
    );
    const highestRatedShop = highestRatedShopResult[0] || null;
    if (highestRatedShop) {
      highestRatedShop.averageRating = parseFloat(
        highestRatedShop.averageRating
      ).toFixed(2);
    }

    // Most Reviewed Shop
    const [mostReviewedShopResult] = await db.query(
      `SELECT s.shop_id AS shopId, s.name AS shopName, COUNT(r.review_id) AS totalReviews
              FROM shoplistings s
              JOIN shopreviews r ON s.shop_id = r.shop_id
              WHERE s.owner_id = ?
              GROUP BY s.shop_id
              ORDER BY totalReviews DESC
              LIMIT 1`,
      [ownerId]
    );
    const mostReviewedShop = mostReviewedShopResult[0] || null;

    // Most Favorite Shop
    const [mostFavoriteShopResult] = await db.query(
      `SELECT s.shop_id AS shopId, s.name AS shopName, COUNT(f.id) AS totalFavorites
              FROM shoplistings s
              JOIN favoriteshops f ON s.shop_id = f.shop_id
              WHERE s.owner_id = ?
              GROUP BY s.shop_id
              ORDER BY totalFavorites DESC
              LIMIT 1`,
      [ownerId]
    );
    const mostFavoriteShop = mostFavoriteShopResult[0] || null;

    // Least Performing Shop (Lowest Average Rating + Lowest Engagement)
    const [leastPerformingShopResult] = await db.query(
      `SELECT s.shop_id AS shopId, s.name AS shopName, 
                     AVG(r.rating) AS averageRating
              FROM shoplistings s
              LEFT JOIN shopreviews r ON s.shop_id = r.shop_id
              WHERE s.owner_id = ?
              GROUP BY s.shop_id
              ORDER BY averageRating ASC
              LIMIT 1`,
      [ownerId]
    );
    const leastPerformingShop = leastPerformingShopResult[0] || null;
    if (leastPerformingShop && leastPerformingShop.averageRating) {
      leastPerformingShop.averageRating = parseFloat(
        leastPerformingShop.averageRating
      ).toFixed(2);
    }

    res.status(200).json({
      highestRatedShop,
      mostReviewedShop,
      mostFavoriteShop,
      leastPerformingShop,
    });
  } catch (err) {
    console.error("getShopPerformanceComparison Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

export const getShopSpecificMetrics = async (req, res) => {
  const { shopId } = req.query;

  try {
    if (!shopId) {
      return res.status(400).json({ message: "Missing shopId parameter." });
    }

    // Verify if the shop exists
    const [shopResult] = await db.query(
      `SELECT shop_id, name 
              FROM shoplistings 
              WHERE shop_id = ?`,
      [shopId]
    );

    if (shopResult.length === 0) {
      return res.status(404).json({ message: "Shop not found." });
    }
    const shop = shopResult[0];

    // Calculate the Average Rating
    const [averageRatingResult] = await db.query(
      `SELECT AVG(r.rating) AS averageRating
              FROM shopreviews r
              WHERE r.shop_id = ?`,
      [shopId]
    );
    const averageRating = parseFloat(
      averageRatingResult[0].averageRating || 0
    ).toFixed(2);

    // Get Review Distribution
    const [reviewDistributionResult] = await db.query(
      `SELECT r.rating, COUNT(*) AS count
              FROM shopreviews r
              WHERE r.shop_id = ?
              GROUP BY r.rating
              ORDER BY r.rating DESC`,
      [shopId]
    );

    // Initialize the review distribution object
    const reviewDistribution = {
      "5.0": 0,
      4.5: 0,
      "4.0": 0,
      3.5: 0,
      "3.0": 0,
      2.5: 0,
      "2.0": 0,
      1.5: 0,
      "1.0": 0,
      0.5: 0,
    };
    reviewDistributionResult.forEach((entry) => {
      reviewDistribution[entry.rating] = parseInt(entry.count, 10);
    });

    // Get Total Number of Reviews
    const [totalReviewsResult] = await db.query(
      `SELECT COUNT(*) AS totalReviews
              FROM shopreviews
              WHERE shop_id = ?`,
      [shopId]
    );
    const totalReviews = totalReviewsResult[0].totalReviews;

    // Get Number of Favorites
    const [numberOfFavoritesResult] = await db.query(
      `SELECT COUNT(*) AS numberOfFavorites
              FROM favoriteShops
              WHERE shop_id = ?`,
      [shopId]
    );
    const numberOfFavorites = numberOfFavoritesResult[0].numberOfFavorites;

    // Send the response with all the metrics
    res.status(200).json({
      shopId: shop.shop_id,
      shopName: shop.name,
      averageRating,
      reviewDistribution,
      totalReviews,
      numberOfFavorites,
    });
  } catch (err) {
    console.error("getShopSpecificMetrics Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

export const getComparisonAcrossShops = async (req, res) => {
  const { ownerId, startDate, endDate } = req.query;

  try {
    if (!ownerId) {
      return res.status(400).json({ message: "Missing ownerId parameter." });
    }

    // Bar Chart of Ratings
    const [barChartRatingsResult] = await db.query(
      `SELECT sl.shop_id AS shopId, sl.name AS shopName, AVG(sr.rating) AS averageRating
              FROM shoplistings sl
              LEFT JOIN shopreviews sr ON sl.shop_id = sr.shop_id
              WHERE sl.owner_id = ?
              GROUP BY sl.shop_id
              ORDER BY averageRating DESC`,
      [ownerId]
    );
    const barChartRatings = barChartRatingsResult.map((shop) => ({
      shopId: shop.shopId,
      shopName: shop.shopName,
      averageRating: parseFloat(shop.averageRating || 0).toFixed(2),
    }));


    // Pie Chart of Favorites Distribution
    const [pieChartFavoritesResult] = await db.query(
      `SELECT sl.shop_id AS shopId, sl.name AS shopName, COUNT(fs.id) AS totalFavorites
              FROM shoplistings sl
              LEFT JOIN favoriteshops fs ON sl.shop_id = fs.shop_id
              WHERE sl.owner_id = ? 
              GROUP BY sl.shop_id
              ORDER BY totalFavorites DESC`,
      [ownerId]
    );
    const pieChartFavorites = pieChartFavoritesResult.map((shop) => ({
      shopId: shop.shopId,
      shopName: shop.shopName,
      totalFavorites: parseInt(shop.totalFavorites, 10),
    }));

    res.status(200).json({
      barChartRatings,
      pieChartFavorites,
    });
  } catch (err) {
    console.error("getComparisonAcrossShops Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};
