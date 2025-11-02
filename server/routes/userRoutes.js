import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/userController.js";
import protect from "../middlewear/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protect, checkAuth);
userRouter.put("/update", protect, updateProfile);

export default userRouter;
