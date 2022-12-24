import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState(
    JSON.parse(localStorage.getItem("notification")) || []
  );

  const [publicKey, setPublicKey] = useState();
  const [privateKey, setPrivateKey] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("notification", JSON.stringify([...notification]));
  }, [notification]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        publicKey,
        setPublicKey,
        privateKey,
        setPrivateKey,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, ChatContext };
