import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const generateRSAKeyPair = async () => {
    //call rsa api
    const { data } = await axios.get(
      "http://localhost:3001/api/key/generateKeyPair"
    );
    if (data) {
      const keyPair = {
        publicKey: data.publicKey,
        privateKey: data.privateKey,
      };

      // Convert the object to a JSON string
      const keyPairJSON = JSON.stringify(keyPair);

      // Store the JSON string in local storage
      localStorage.setItem("keyPair", keyPairJSON);
    }
  };

  const handleClick = () => {
    setShow(!show);
  };
  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const formData = new FormData();
      formData.append("file", pics);
      formData.append("upload_preset", "tchat-app");
      formData.append("cloud_name", "dyd07j8g5");

      fetch("https://api.cloudinary.com/v1_1/dyd07j8g5/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setPicLoading(true);

    ///run below code after completing rsa so check if rsa is complete or not

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    // console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        " http://localhost:3001/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      // console.log(data);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      generateRSAKeyPair();
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing={"5px"}>
      <FormControl id="first-name" isRequired={true}>
        <FormLabel>Name</FormLabel>
        <Input
          name="name"
          placeholder="Enter your name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </FormControl>
      <FormControl id="email" isRequired={true}>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          placeholder="Enter your Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </FormControl>
      <FormControl id="password" isRequired={true}>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.7rem"} size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="password" isRequired={true}>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            name="confirmPassword"
            type={show ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.7rem"} size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic" isRequired={true}>
        <FormLabel>Upload Your Picture</FormLabel>
        <Input
          name="image"
          type={"file"}
          p={1.5}
          accept="image/*"
          onChange={(e) => {
            postDetails(e.target.files[0]);
          }}
        />
      </FormControl>
      <Button
        colorScheme={"blue"}
        width="100%"
        color={"white"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        SignUp
      </Button>
    </VStack>
  );
};

export default Signup;
