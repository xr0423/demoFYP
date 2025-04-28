import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequestStatus,
  removeFriend,
  cancelFriendRequest,
  getAllFriends,
  getFriendRequest,
  getRequest,
  getFriendsWithoutMeetupRequest,
  getApprovedFollows,
  getExpertFriendlist,
} from "../controllers/friendRequest.js";

const router = express.Router();

router.post("/send", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.get("/status", getFriendRequestStatus);
router.delete("/remove", removeFriend);
router.delete("/cancel" ,cancelFriendRequest)
router.get("/getall", getAllFriends);
router.get("/getFriendRequest", getFriendRequest);
router.get("/getRequest", getRequest);
router.get("/withoutMeetupRequest", getFriendsWithoutMeetupRequest);


router.get("/getApproved", getApprovedFollows);
router.get("/getExpertFriendlist", getExpertFriendlist);
export default router;
