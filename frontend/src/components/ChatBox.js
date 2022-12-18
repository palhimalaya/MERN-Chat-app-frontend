import { messages } from "../data/messages";
import "./styles.css";
import {
  Avatar,
  Tooltip,
  Box,
  Text,
  Input,
  FormControl,
} from "@chakra-ui/react";
import { useContext } from "react";
import { ChatContext } from "../Context/ChatProvider.js";
import SingleChat from "../components/SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useContext(ChatContext);
  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
