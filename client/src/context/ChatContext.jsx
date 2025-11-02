import { createContext } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/message/users");

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //fuunction to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/message/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to send message to selected user

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // //subscribe to messages for selected user
  // const subscribeToMessages = async () => {
  //   if (!socket) return;

  //   socket.on("newMessage", (newMessage) => {
  //     if (selectedUser && newMessage.senderId === selectedUser._id) {
  //       newMessage.seen = true;
  //       setMessages((prevMessages) => [...prevMessages, newMessage]);
  //       axios.put(`/api/message/mark/${newMessage._id}`);
  //     } else {
  //       setUnseenMessages((prevUnseenMessages) => ({
  //         ...prevUnseenMessages,
  //         [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
  //           ? prevUnseenMessages[newMessage.senderId] + 1
  //           : 1,
  //       }));
  //     }
  //   });
  // };

  ///unsubscribe from messages for selected user
  // const unsubscribeFromMessages = () => {
  //   if (socket) socket.off("newMessage");
  // };
  // useEffect(() => {
  //   if (!socket) return; // prevent null error

  //   socket.on("connect", () => {
  //     console.log("✅ Socket connected:", socket.id);
  //   });

  //   return () => socket.off("connect");
  // }, [socket]);

  // useEffect(() => {
  //   subscribeToMessages();
  //   return () => unsubscribeFromMessages();
  // }, [socket, selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      console.log("📩 Received new message:", newMessage);

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/message/mark/${newMessage._id}`);
      } else {
        // ✅ Increase unseen count properly
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setUnseenMessages((prev) => ({
        ...prev,
        [selectedUser._id]: 0,
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log("Updated unseen messages:", unseenMessages);
  }, [unseenMessages]);
  const value = {
    users,
    messages,
    selectedUser,
    getUsers,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
