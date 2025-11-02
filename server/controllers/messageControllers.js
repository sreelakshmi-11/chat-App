import Message from "../models/Message.js";
import User from "../models/User.js";
import { getReceiverSocketId } from "../server.js";
import { io } from "../server.js";

export const getusersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    console.log("Filtered users:", filteredUsers);

    //count number of unseen messages
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//get all messages for selectedId

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: selectedUserId, receiverId: myId },
        { senderId: myId, receiverId: selectedUserId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//api to mark message as seen using messageId

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//send message

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seen: false,
    });
    ///emit new message to the receivers socket
    const receiverSocketId = getReceiverSocketId[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log("📤 Emitted newMessage to:", receiverSocketId);
    }

    res.json({
      success: true,
      newMessage: newMessage,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
