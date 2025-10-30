import express from "express";
import protect from "../middlewear/auth.js";
import {
  getMessages,
  getusersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageControllers.js";

const messageRouter = express.Router();

messageRouter.get("/users", protect, getusersForSidebar);
messageRouter.get("/:id", protect, getMessages);
messageRouter.put("/mark/:id", markMessageAsSeen);
messageRouter.post("/send/:id", protect, sendMessage);

export default messageRouter;
