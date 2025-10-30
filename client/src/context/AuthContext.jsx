import { createContext, useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const backendurl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendurl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  //checking if user is authenticated and if so,set the user data andconnect the socket

  const checkAuth = async () => {
    try {
      const { data } = await axios.post("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //login

  const login = async (status, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${status}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["authorization"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //logout

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out Successfully");
    socket.disconnect();
    navigate("/login");
  };
  //update profile

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //connect socket function to handle socket connection and online users updates

  const connectSocket = async (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendurl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      console.log("AuthContext token:", token);
      axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const value = {
    login,
    token,
    axios,
    authUser,
    onlineUsers,
    socket,
    logout,
    updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
