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
  const { socket, axios, authUser } = useContext(AuthContext);
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/message/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
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

      // socket.emit("sendMessage", data.newMessage);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const isForMe = newMessage.receiverId === authUser._id;

      // message between logged-in user and selected user
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/message/mark/${newMessage._id}`);
      } else if (isForMe) {
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
  }, [socket]); // ✅ only depends on socket, NOT selectedUser

  useEffect(() => {
    const loadMessages = async () => {
      if (selectedUser) {
        await getMessages(selectedUser._id);
        setUnseenMessages((prev) => ({
          ...prev,
          [selectedUser._id]: 0,
        }));
      }
    };

    loadMessages();
  }, [selectedUser]);

  useEffect(() => {}, [unseenMessages]);
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
