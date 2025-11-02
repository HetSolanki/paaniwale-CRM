import express from "express";
import axios from "axios";

const router = express.Router();
const otpStore = {};
import process from "process";

router.post("/send", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phone] = otp;

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const url = `https://control.msg91.com/api/v5/flow`;

  const data = {
    template_id: templateId,
    short_url: "1",
    short_url_expiry: "300",
    realTimeResponse: "1",
    recipients: [
      {
        mobiles: `91${phone}`,
        number: otp,
      },
    ],
  };

  try {
    const axiosRes = await axios.post(url, data, {
      headers: {
        authKey: authKey,
        "Content-Type": "application/json",
      },
    });

    if (axiosRes.status !== 200) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    // console.log(axiosRes)

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
    // console.log("OTP sent successfully:", axiosRes.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
    console.error("Error sending OTP:", error);
  }
});

router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] && otpStore[phone] == otp) {
    delete otpStore[phone];
    return res.json({ success: true, message: "OTP verified" });
  }
  res.status(400).json({ success: false, message: "Invalid OTP" });
});

export default router;
