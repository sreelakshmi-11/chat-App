import Message from "../models/Message.js";
import User from "../models/User.js";
import { userSocketMap } from "../server.js";
import { io } from "../server.js";

export const getusersForSidebar = async (req, res) => {
  try {
    // const userId = req.user._id;
    // const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
    //   "-password"
    // );
    console.log("✅ getusersForSidebar called");
    console.log("req.user:", req.user);

    const userId = req.user._id;
    console.log("Current userId:", userId);

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
    const receiverId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: selectedUserId, receiverId: myId },
        { senderId: myId, receiverId: selectedUserId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
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
    const senderId = req.params.id;
    const receiverId = req.user._id;

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
    });
    ///emit new message to the receivers socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
