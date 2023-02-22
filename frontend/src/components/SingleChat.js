import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
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
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useContext(ChatContext);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState(null);
  // const [othersPublicKey, setOthersPublicKey] = useState();

  // const handleImageUpload = (event) => {
  //   setImage(event.target.files[0]);
  //   console.log(event.target.files[0]);
  // };
  // Access the public and private keys

  const encryptMessage = async () => {
    const array = JSON.parse(localStorage.getItem("othersPublicKey"));
    try {
      var matchingObject = array.find(function (obj) {
        return obj.chatId === selectedChat._id;
      });

      if (matchingObject) {
        var othersKey = matchingObject.publicKey;
      } else {
        console.log(`Object with name "${selectedChat._id}" not found`);
      }
    } catch (error) {}

    const postData = {
      message: newMessage,
      publicKey: othersKey,
    };

    // const stringifyPostData = JSON.stringify(postData);
    // const keyHex = process.env.REACT_APP_AES_KEY;
    // const key = JSON.stringify(keyHex);
    // const encrypted = CryptoJS.AES.encrypt(stringifyPostData, key).toString();

    const encryptedResult = await axios.post(
      "http://localhost:3001/api/key/encryptData",
      postData
    );

    return encryptedResult;
  };

  const decryptMessage = async (m) => {
    const keyPairJSON = localStorage.getItem("keyPair");
    // Convert the JSON string back into an object
    const keyPair = JSON.parse(keyPairJSON);
    if (!keyPair) {
      console.log("No key pair found");
      localStorage.removeItem("userInfo");
    } else {
      var privateKey = keyPair.privateKey;
    }
    const postData = {
      message: m,
      privateKey: privateKey,
    };

    const { data } = await axios.post(
      "http://localhost:3001/api/key/decryptData",
      postData
    );
    // console.log(decryptedResult);
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

  const fetchLocalMessages = async () => {
    if (!selectedChat) return;

    try {
      let key = JSON.parse(localStorage.getItem("keyPair"));

      let publicKey = key.publicKey;

      socket.emit("join chat", {
        room: selectedChat._id,
        publicKey: publicKey,
        publicECDHKey: JSON.parse(localStorage.getItem("ECDHPublicKey")),
      });
      const localMessages = JSON.parse(localStorage.getItem("localMessages"));
      const filteredMessages = localMessages.filter(
        (message) => message.chat._id === selectedChat._id
      );

      setMessages(filteredMessages);
      setLoading(false);
    } catch (error) {
      // toast({
      //   title: "Error Occurred! ",
      //   description: "Failed to fetch the Messages",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "bottom",
      // });
    }

    // setLocalMessage(localMessagesJSON);
  };

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

      // setMessages(data);
      setLoading(false);
      // socket.emit("join chat", {
      //   room: selectedChat._id,
      //   publicKey: publicKey,
      // });
    } catch (error) {
      // toast({
      //   title: "Error Occurred! ",
      //   description: "Failed to fetch the Messages",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "bottom",
      // });
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      const a = await encryptMessage().then((res) => {
        return res;
      });

      const encryptedMessage = a.data;
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
        //save updatedMessageReceived to local storage
        setMessages([...messages, updatedMessageReceived]);
        localStorage.setItem(
          "localMessages",
          JSON.stringify([...messages, updatedMessageReceived])
        );
      } catch (error) {
        toast({
          title: "Error Occurred! ",
          description: "Failed to send the Message or message is too large",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
    // if (image) {
    //   const formData = new FormData();
    //   formData.append("image", image);
    //   formData.append("chatId", selectedChat._id);
    //   const config = {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       Authorization: `Bearer ${user.token}`,
    //     },
    //   };

    //   const { data } = await axios.post(
    //     "http://localhost:3001/image-upload",
    //     formData,
    //     config
    //   );
    //   console.log(data);
    //   //sending image from socket
    //   socket.emit("image", data.filename);
    //   setImage(null);
    // }
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
    fetchLocalMessages();

    selectedChatCompare = selectedChat;
    socket.on("public key", ({ room, publicKey }) => {
      let data = {
        chatId: room,
        publicKey: publicKey,
      };
      localStorage.setItem(
        "othersPublicECDHKey",
        JSON.stringify(data.publicECDHKey)
      );

      try {
        var array = JSON.parse(localStorage.getItem("othersPublicKey"));
        var existingObject = array.find(function (obj) {
          // console.log(
          //   JSON.stringify(obj.chatId) === JSON.stringify(data.chatId)
          // );
          return JSON.stringify(obj.chatId) === JSON.stringify(data.chatId);
        });

        if (!existingObject) {
          // If the object is not found, add it to the array
          console.log(room + " is not present in the array");
          array.push(data);
          localStorage.setItem("othersPublicKey", JSON.stringify(array));
        }
      } catch (error) {
        localStorage.setItem("othersPublicKey", JSON.stringify([data]));
      }

      // console.log("r", publicKey); // prints the value of the additionalData property
    });

    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", ({ newMessageReceived, encD }) => {
      // setLocalMessage(localMessagesJSON);

      console.log("message received", newMessageReceived.content);

      // console.log("message received", data.chat._id);
      decryptMessage(newMessageReceived.content).then((res) => {
        const m = res;
        const data = {
          ...newMessageReceived,
          content: res,
        };
        console.log(m);
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
          setMessages([...messages, data]);
          localStorage.setItem(
            "localMessages",
            JSON.stringify([...messages, data])
          );
        }
      });
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
              {/* <div className="image-upload">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div> */}
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
