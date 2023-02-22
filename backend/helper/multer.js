const multer = require("multer");

//Configuration for Multer
const Storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({
  storage: Storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      console.log("File type not supported. Only jpeg and png are supported");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
module.exports = upload;
