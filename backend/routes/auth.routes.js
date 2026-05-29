import express from "express";
import { signIn, signup, getUserProfile, updateUserProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/sign-in", signIn);
router.get("/user-profile", verifyToken, getUserProfile);
router.put("/update-profile", verifyToken, updateUserProfile);

export default router;