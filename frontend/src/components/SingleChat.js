import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useState } from "react";
import { useEffect } from "react";
import ProfileModal from "../components/miscellaneous/ProfileModel";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatContext } from "../Context/ChatProvider.js";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import "./styles.css";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = "http://localhost:3001";
var socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    publicKey,
    setPublicKey,
    privateKey,
    setPrivateKey,
  } = useContext(ChatContext);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState();
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [othersPublicKey, setOthersPublicKey] = useState();

  const [localMessage, setLocalMessage] = useState([]);
  const [latestLocalMessage, setLatestLocalMessage] = useState();

  var a;

  // Access the public and private keys

  useEffect(() => {
    // Retrieve the JSON string from local storage
    const keyPairJSON = localStorage.getItem("keyPair");

    // Convert the JSON string back into an object
    const keyPair = JSON.parse(keyPairJSON);
    if (!keyPair) {
      return;
    } else {
      var pKey = keyPair.publicKey;
      var prKey = keyPair.privateKey;
    }

    setPublicKey(pKey);
    setPrivateKey(prKey);
    console.log("public key", publicKey);
  }, []);

  const encryptMessage = async () => {
    const postData = {
      message: newMessage,
      publicKey: othersPublicKey,
    };

    const { data } = await axios.post(
      "http://localhost:3001/api/key/encryptData",
      postData
    );

    const { encryptedResult } = data;

    return encryptedResult;
  };

  const decryptMessage = async (m) => {
    const postData = {
      message: m,
      privateKey: privateKey,
    };

    const { data } = await axios.post(
      "http://localhost:3001/api/key/decryptData",
      postData
    );
    const { decryptedResult } = data;
    console.log(decryptedResult);
    return data;
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:3001/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      socket.emit("join chat", {
        room: selectedChat._id,
        publicKey: publicKey,
      });
    } catch (error) {
      toast({
        title: "Error Occurred! ",
        description: "Failed to fetch the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      a = await encryptMessage().then((res) => {
        return res;
      });

      const encryptedMessage = a.data;

      // console.log(encryptedResult.data);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:3001/api/message",
          {
            content: encryptedMessage,
            chatId: selectedChat._id,
          },
          config
        );

        //sending message from socket
        socket.emit("new message", data);

        const updatedMessageReceived = {
          ...data,
          content: newMessage,
        };
        localStorage.setItem("localMessages", updatedMessageReceived);
        setMessages([...messages, updatedMessageReceived]);
      } catch (error) {
        toast({
          title: "Error Occurred! ",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    socket.on("public key", (data) => {
      localStorage.setItem("othersPublicKey", data);

      // console.log(data); // prints the value of the additionalData property
    });
    const othersKey = localStorage.getItem("othersPublicKey");
    setOthersPublicKey(othersKey);
    // console.log(othersKey);

    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", ({ newMessageReceived }) => {
      // console.log("message received", newMessageReceived.content
      const data = {
        ...newMessageReceived,
        chat: { ...newMessageReceived.chat },
      };

      console.log("message received", data.chat._id);
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        //give notification
        if (!notification.includes(data)) {
          setNotification([data, ...notification]);
          //save notification to localstorage

          setFetchAgain(!fetchAgain);
        }
      } else {
        setLatestLocalMessage(data.chat.content);
        setLocalMessage([...localMessage, data.chat.content]);

        setMessages([...messages, data]);
      }
    });
  });

  const typingHandle = async (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work Sans"
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius="lg"
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf="center"
                margin={"auto"}
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant={"filled"}
                bg="#E0E0E0"
                placeholder="Enter a message.."
                onChange={typingHandle}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems="center"
          justifyContent="center"
          height={"100%"}
        >
          <Text fontSize={"3XL"} pb={3} fontFamily="Work Sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
