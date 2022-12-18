import React, { useContext, useState } from "react";
import {
  ModalFooter,
  Button,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatContext } from "../../Context/ChatProvider";

const UpdateGroupChatModal = (fetchAgain, setFetchAgain) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = useContext(ChatContext);
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toasts = useToast();
  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{}</ModalHeader>
          <ModalCloseButton />
          <ModalBody></ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
