import express from "express";
import {
  getShopListing,
  getShoplistingRelatedData,
  createShopListing,
  updateShopListing,
  deleteShopListing,
  getAllShopListing,
  getMenuItemRelatedData,
  createMenuItem,
  deleteMenuItem,
  getShopListingByShopId,
  getMenuItem,
  updateMenuItem,
  getFavoriteShops,
  addFavoriteShop,
  removeFavoriteShop,
  getGallery,
  uploadGallery,
  deleteGallery,
  getRewards,
  createReward,
  deleteReward,
  updateReward,
  getRewardDetails,
  getHighlightedShops,
  getShopName,
  featureShop,
  validateOwner,
  getShoplistingStatus,
  getOwnerByShopId
} from "../controllers/shoplistings.js";

const router = express.Router();

router.get('/status', getShoplistingStatus);

router.get("/findall", getAllShopListing);
router.get("/find", getShopListing);
router.get("/find/highlights", getHighlightedShops);
router.get("/find/:shopId", getShopListingByShopId);
router.get("/related-data", getShoplistingRelatedData);
router.post("/create/", createShopListing);
router.put("/update/:shopId", updateShopListing);
router.delete("/delete/:shopId", deleteShopListing);
router.get("/findshopname", getShopName)
router.get("/getOwner", getOwnerByShopId)


router.get("/FavoriteShops", getFavoriteShops);
router.post("/addFavoriteShop", addFavoriteShop);
router.delete("/removeFavoriteShop", removeFavoriteShop);

router.get("/menuitem", getMenuItem);
router.get("/menuitem/related-data", getMenuItemRelatedData);
router.post("/menuitem", createMenuItem);
router.delete("/menuitem", deleteMenuItem);
router.put("/menuitem/", updateMenuItem);

router.get("/gallery/", getGallery);
router.post("/gallery", uploadGallery);
router.delete("/gallery", deleteGallery);

router.get("/rewards", getRewards); // Fetch rewards for a shop
router.post("/rewards", createReward); // Create reward for a shop
router.delete("/rewards", deleteReward); // Delete a specific reward
router.put("/rewards/", updateReward); // Update a specific reward
router.get("/rewards/details", getRewardDetails);

router.put("/feature/:id", validateOwner, featureShop)

export default router;
