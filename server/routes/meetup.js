import express from "express";
import {createMeetup, deleteMeetup, getMeetupRelatedData, updateMeetup, getMeetUp, getMeetUpRequests, addMeetUpRequests, acceptMeetUpRequests, rejectMeetUpRequests, getRequests} from "../controllers/meetup.js";

const router = express.Router();



router.delete("/reject", rejectMeetUpRequests)
router.post("/", createMeetup);
router.get("/", getMeetUp);
router.get("/related-data", getMeetupRelatedData)

router.delete("/", deleteMeetup);
router.put("/update/:meetupId", updateMeetup); // Use a dynamic route parameter for meetupId
router.get("/meetupRequests", getMeetUpRequests);
router.post("/meetupRequests", addMeetUpRequests);
router.get("/getrequest", getRequests);
router.post("/accept", acceptMeetUpRequests)





export default router;