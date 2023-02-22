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
import { useEffect } from "react";
import crypto from "crypto";

const Login = () => {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [keys, setKeys] = useState({});

  const handleClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    navigate("/chats");
  }, [keys, navigate]);

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

  const submitHandler = async () => {
    setPicLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    //console.log(email, password);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        " http://localhost:3001/api/user/login",
        {
          email,
          password,
        },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      // Retrieve the JSON string from local storage

      const keyPairJSON = localStorage.getItem("keyPair");

      // Convert the JSON string back into an object
      const keyPair = JSON.parse(keyPairJSON);

      if (!keyPair) {
        await generateRSAKeyPair();
        setKeys(keyPairJSON);
      }

      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.message,
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
      <FormControl id="email" isRequired={true}>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          value={email}
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
            value={password}
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

      <Button
        colorScheme={"blue"}
        width="100%"
        color={"white"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Login
      </Button>
      <Button
        variant={"solid"}
        colorScheme={"red"}
        width="100%"
        color={"white"}
        style={{ marginTop: 15 }}
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("12345");
        }}
      >
        Get Guest User credentials
      </Button>
    </VStack>
  );
};

export default Login;
