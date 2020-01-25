import express from "express";


const router = express.Router();

router.get("/", (req, res) => res.json({version:"0.0.0",api:"servo"}));


export default router;
