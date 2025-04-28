import express from "express";
import {
  getUserVouchers,
  getPointsBalance,
  redeemVoucher,
  useVoucher,
} from "../controllers/myrewards.js";

const router = express.Router();
// In your routes configuration
router.get("/", getUserVouchers);
router.get("/points", getPointsBalance);
router.post("/redeem", redeemVoucher);
router.post("/use", useVoucher);

export default router;
