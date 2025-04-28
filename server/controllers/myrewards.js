import { db } from "../connect.js";

export const getUserVouchers = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const q = `
      SELECT uv.*, v.voucher_name, v.value_in_dollars, v.img
      FROM user_vouchers uv 
      JOIN vouchers v ON uv.voucher_id = v.voucher_id 
      WHERE uv.user_id = ?
  `;

  try {
    const [userVouchers] = await db.query(q, [userId]);
    if (userVouchers.length === 0) {
      return res.status(404).json({ error: "No vouchers found for this user" });
    }

    return res.status(200).json(userVouchers);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getPointsBalance = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `
        SELECT points_balance 
        FROM rewardpoints 
        WHERE user_id = ?
    `;

  try {
    const [result] = await db.query(query, [userId]);

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result[0]);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const redeemVoucher = async (req, res) => {
  const { userId, voucherId } = req.body;

  if (!userId || !voucherId) {
    return res
      .status(400)
      .json({ error: "User ID and Voucher ID are required" });
  }

  try {
    // Fetch voucher details
    const [voucher] = await db.query(
      "SELECT * FROM vouchers WHERE voucher_id = ?",
      [voucherId]
    );

    if (!voucher || voucher.length === 0 || voucher[0].amount_available <= 0) {
      return res.status(400).json({ error: "Voucher not available" });
    }

    // Fetch user points
    const [user] = await db.query(
      "SELECT `points_balance` FROM `rewardpoints` WHERE `user_id` = ?",
      [userId]
    );

    if (!user || user.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user[0].points_balance < voucher[0].points_cost) {
      return res.status(400).json({ error: "Insufficient points balance" });
    }

    // Deduct points from user and reduce voucher availability
    const redeemedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(redeemedDate.getDate() + voucher[0].validity_period);

    // Begin transaction
    await db.beginTransaction();

    // Insert the voucher into the user's voucher list
    await db.query(
      "INSERT INTO `user_vouchers` (`user_id`, `voucher_id`, `redeemed_date`, `expiry_date`, `status`) VALUES (?, ?, ?, ?, 'Available')",
      [userId, voucherId, redeemedDate, expiryDate]
    );

    // Update the voucher availability
    await db.query(
      "UPDATE `vouchers` SET `amount_available` = `amount_available` - 1 WHERE `voucher_id` = ?",
      [voucherId]
    );

    // Deduct points from the user's balance
    await db.query(
      "UPDATE `rewardpoints` SET `points_balance` = `points_balance` - ?, `points_spent` = `points_spent` + ? WHERE `user_id` = ?",
      [voucher[0].points_cost, voucher[0].points_cost, userId]
    );

    // Commit the transaction
    await db.commit();

    return res.status(200).json({ success: "Voucher redeemed successfully" });
  } catch (err) {
    // Rollback transaction in case of an error
    await db.rollback();

    console.error("Error redeeming voucher:", err); // Add detailed error logging
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const useVoucher = async (req, res) => {
  const { userId, voucherId } = req.body;

  if (!userId || !voucherId) {
    return res
      .status(400)
      .json({ error: "User ID and Voucher ID are required" });
  }

  try {
    // Check if the voucher is available
    const [voucher] = await db.query(
      "SELECT * FROM user_vouchers WHERE user_voucher_id = ? AND user_id = ? AND status = 'Available'",
      [voucherId, userId]
    );

    if (!voucher || voucher.length === 0) {
      return res.status(400).json({ error: "Voucher is not available" });
    }

    // Update the voucher status to 'Used' and set used_date to the current date
    const usedDate = new Date();
    await db.query(
      "UPDATE user_vouchers SET status = 'Used', used_date = ? WHERE user_voucher_id = ? AND user_id = ?",
      [usedDate, voucherId, userId]
    );

    return res.status(200).json({ success: "Voucher used successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
