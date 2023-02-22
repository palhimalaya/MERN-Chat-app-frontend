const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// generate key pair
module.exports.generateServerKey = async () => {
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
  //   const credentialsPath = path.join("backend", "credentials");
  //   if (!fs.existsSync(credentialsPath)) {
  //     fs.mkdirSync(credentialsPath);
  //   }
  //   // write private key to file
  //   const privateKeyPath = path.join(credentialsPath, "private.key");
  fs.writeFileSync("private.key", privateKey, { mode: 0o600 });

  // write public key to file
  //   const publicKeyPath = path.join(credentialsPath, "public.key");
  fs.writeFileSync("public.key", publicKey);

  console.log("created");
};
