import express from "express";
import {
  getEvents,
  getEventTypes,
  deleteEvent,
  addEvent,
  updateEvent,
  getEventRelatedData,
  joinEvent,
  quitEvent,
  getUserEventStatus,
  getUserEvents,
  getJoinedEventsByShop
} from "../controllers/events.js";

const router = express.Router();


router.get("/related-data", getEventRelatedData);
router.get("/eventtypes", getEventTypes);
router.get("/joined-events", getUserEventStatus);
router.get("/user-events", getUserEvents);
router.post("/join", joinEvent);
router.delete("/quit", quitEvent);
router.get("/getJoinedEvents", getJoinedEventsByShop);

router.post("/", addEvent);
router.get("/", getEvents);
router.delete("/", deleteEvent);
router.put("/", updateEvent);


export default router;
