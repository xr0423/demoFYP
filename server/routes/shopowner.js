import express from "express";
import {
  getComparisonAcrossShops,
  getOverviewMetrics,
  getShopPerformanceComparison,
  getShopSpecificMetrics,
} from "../controllers/shopowner.js";

const router = express.Router();

router.get("/metrics/overview", getOverviewMetrics);
router.get("/metrics/performance-comparison", getShopPerformanceComparison);
router.get("/metrics", getShopSpecificMetrics); // get specific shop metrics
router.get("/metrics/comparison", getComparisonAcrossShops); //  Get Comparison Across Shops for Graphical View
export default router;
