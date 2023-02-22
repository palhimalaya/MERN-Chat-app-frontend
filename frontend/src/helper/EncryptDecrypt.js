import crypto from "crypto";
const key = JSON.parse(localStorage.getItem("keyPair"));
const publicKey = key.publicKey;
const privateKey = key.privateKey;
export const encryptData = async () => {
  const message = "Hello, world!";
  const buffer = Buffer.from(message);
  const encrypted = crypto.publicEncrypt({ key: publicKey }, buffer);
  console.log(encrypted.toString("base64"));
  return encrypted;
};

export const decryptData = async (encrypted) => {
  // Decrypt the message using the private key

  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase: "your-passphrase",
    },
    encrypted
  );
  console.log(decrypted.toString());
};

export const h = async () => {
  const encrypted = await encryptData();
  await decryptData(encrypted);
};
