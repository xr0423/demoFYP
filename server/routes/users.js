import express from "express";
import {
  getUser,
  updateRegUser,
  getUserActivities,
  getRegularUserRelatedData,
  getUserNotification,
  getUserPlan,
  upgradePlan,
  searchUsers,
  getOwnerCoins,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/user.js";
import { getArticles } from "../controllers/articles.js";

const router = express.Router();

router.get("/allNotifications", getNotifications);
router.get("/coins", getOwnerCoins);
router.get("/related-data", getRegularUserRelatedData);
router.get("/activity", getUserActivities);
router.get("/notification", getUserNotification);
router.get("/find/:userId", getUser);
router.put("/", updateRegUser);

router.get("/articles", getArticles);
router.get("/plan", getUserPlan);
router.post("/plan/upgrade", upgradePlan);

router.get("/search", searchUsers);

router.put("/notification/:notificationId/markAsRead", markNotificationAsRead);
router.put('/markAllNotificationsAsRead', markAllNotificationsAsRead);

export default router;


