const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const keyGeneration = asyncHandler(async (req, res) => {
  //generate rsa key pair

  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "your-passphrase",
    },
  });

  res.send({ publicKey, privateKey });
});

const encryptData = asyncHandler(async (req, res) => {
  // Encrypt the data using the public key
  // Define the chunk size (must be smaller than the key size)

  // const keyHex = process.env.AES_KEY;
  // const key = keyHex.toString();
  const data = await req.body;

  // Use the decrypted data as needed

  const publicKey = data.publicKey;
  const message = data.message;
  const chunkSize = 50;

  function chunk(str, size) {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }

    return chunks;
  }

  const chunks = chunk(message, chunkSize);
  const encryptedChunks = chunks.map((chunk) => {
    const buffer = Buffer.from(chunk, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );

    return encrypted.toString("base64");
  });

  res.send(encryptedChunks);
});

const decryptData = asyncHandler(async (req, res) => {
  // Decrypt the encrypted data using the private key
  // Define the chunk size (must be smaller than the key size)
  const data = await req.body;

  const privateKey = data.privateKey;
  const encryptedChunks = JSON.parse(data.message);

  const decryptedChunks = encryptedChunks.map((encrypted) => {
    const buffer = Buffer.from(encrypted, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: "your-passphrase",
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );

    return decrypted.toString("utf8");
  });

  const decryptedResult = decryptedChunks.join("");

  res.send(decryptedResult); // prints "Hello, world!"
});

module.exports = { keyGeneration, encryptData, decryptData };
