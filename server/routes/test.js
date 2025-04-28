import express from "express";
import { db } from "../connect.js";

const router = express.Router();

router.get("/", async (req, res) => {
     try{
          const [data] = await db.query(`SELECT * FROM users;`)
          return res.json(data);
     }catch(error){
          console.log(error);
     }
})

export default router;