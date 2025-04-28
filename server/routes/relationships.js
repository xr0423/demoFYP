import express from "express";
import {
  getRelationships,
  addRelationship,
  deleteRelationship,
  getPeopleIFollow,
} from "../controllers/relationship.js";

const router = express.Router();

router.get("/followers", getRelationships); // Endpoint to get followers of a user
router.get("/following", getPeopleIFollow); // New endpoint to get people the user is following
router.post("/", addRelationship);
router.delete("/", deleteRelationship);


export default router;
