const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const keyGeneration = asyncHandler(async (req, res) => {
  //generate rsa key pair
  const { publicKey, privateKey } = await crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "top secret",
    },
  });

  res.send({ publicKey, privateKey });
});

const encryptData = asyncHandler(async (req, res) => {
  // Encrypt the data using the public key
  // Define the chunk size (must be smaller than the key size)
  const datas = await req.body;
  const publicKey = datas.publicKey;
  const data = datas.message;
  const chunkSize = 128;
  // Split the data into chunks
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  // Encrypt or decrypt the chunks
  const result = [];
  for (const chunk of chunks) {
    result.push(crypto.publicEncrypt(publicKey, chunk));
  }
  // Concatenate the encrypted or decrypted chunks
  const encryptedResult = Buffer.concat(result);

  res.send({ encryptedResult });
});

const decryptData = asyncHandler(async (req, res) => {
  // Decrypt the encrypted data using the private key
  // Define the chunk size (must be smaller than the key size)
  const datas = await req.body;

  const privateKey = datas.privateKey;
  const encrypted = datas.message;

  console.log(encrypted);

  const chunkSize = 256;

  // Split the data into chunks
  const chunks = [];
  for (let i = 0; i < encrypted.length; i += chunkSize) {
    chunks.push(encrypted.slice(i, i + chunkSize));
  }

  // Encrypt or decrypt the chunks
  const result = [];
  for (const chunk of chunks) {
    result.push(crypto.privateDecrypt(privateKey, chunk));
  }

  // Concatenate the encrypted or decrypted chunks
  const decryptedResult = Buffer.concat(result);
  console.log(decryptedResult.toString());

  res.send(decryptedResult); // prints "Hello, world!"
});

module.exports = { keyGeneration, encryptData, decryptData };
