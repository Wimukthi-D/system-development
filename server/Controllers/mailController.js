const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const router = express.Router();
require("dotenv").config();

router.use(bodyParser.json());
router.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append file extension
  },
});
const upload = multer({ storage: storage });

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "wimu.personal@gmail.com", // use environment variables for security
    pass: "fnyfhoplkpjarihw",
  },
});


router.post("/send", upload.single("attachment"), async (req, res) => {
  const { to, subject, text } = req.body.formD;
  const attachment = req.file.filename;

  console.log(req.body);

  if (!to || !subject || !text || !attachment) {
    return res.status(400).send("Missing required fields or attachment.");
  }

  var mailOptions = {
    from: "wimu.personal@gmail.com",
    to: to,
    subject: subject,
    text: text,
    attachments: [
      {
        path: attachment.path,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).send("Error sending email.");
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).send("Email sent successfully.");
    }
  });
});

module.exports = router;
