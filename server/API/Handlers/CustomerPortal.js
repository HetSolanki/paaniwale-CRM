import Customer from "../Schema/customer.js";
import CustomerEntry from "../Schema/customerEntry.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import process from "process";

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via WhatsApp
const sendWhatsAppOTP = async (phone_number, otp) => {
  try {
    const whatsappApiVersion = process.env.VITE_WHATSAPP_API_VERSION;
    const phoneNumberId = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.VITE_WHATSAPP_USER_ACCESS_TOKEN;

    if (!whatsappApiVersion || !phoneNumberId || !accessToken) {
      console.error("WhatsApp configuration missing");
      return false;
    }

    const url = `https://graph.facebook.com/${whatsappApiVersion}/${phoneNumberId}/messages`;

    // Using the same template as Editcustomer.jsx
    const message = {
      messaging_product: "whatsapp",
      to: `91${phone_number}`,
      type: "template",
      template: {
        name: "otp_verification",
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: `${otp}`,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: `${otp}`,
              },
            ],
          },
        ],
      },
    };

    await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error) {
    console.error(
      "Error sending WhatsApp OTP:",
      error.response?.data || error.message
    );
    return false;
  }
};

// Send OTP to customer
export const sendCustomerOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.json({
        status: "error",
        message: "Phone number is required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findOne({ cphone_number: phone_number });

    if (!customer) {
      return res.json({
        status: "error",
        message: "No account found with this phone number",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with 5 minutes expiry
    otpStore.set(phone_number, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Send OTP via WhatsApp
    const whatsappSent = await sendWhatsAppOTP(phone_number, otp);

    if (!whatsappSent) {
      // If WhatsApp fails, log to console for development
      console.log(`⚠️ WhatsApp send failed. OTP for ${phone_number}: ${otp}`);
    }

    res.json({
      status: "success",
      message: "OTP sent successfully to your WhatsApp",
      // Remove this in production - only for development
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.json({
      status: "error",
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP and generate token
export const verifyCustomerOTP = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.json({
        status: "error",
        message: "Phone number and OTP are required",
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(phone_number);

    if (!storedData) {
      return res.json({
        status: "error",
        message: "OTP not found or expired. Please request a new one.",
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone_number);
      return res.json({
        status: "error",
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.json({
        status: "error",
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid, delete it
    otpStore.delete(phone_number);

    // Find customer
    const customer = await Customer.findOne({ cphone_number: phone_number });

    if (!customer) {
      return res.json({
        status: "error",
        message: "Customer not found",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer._id,
        phone: phone_number,
        type: "customer",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      status: "success",
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.json({
      status: "error",
      message: "Failed to verify OTP",
    });
  }
};

// Get customer dashboard data
export const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.customer.customerId;

    // Get customer details
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    // Get current month's date range
    const currentDate = new Date();
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get customer entries for current month
    const entries = await CustomerEntry.find({
      cid: customerId,
      delivery_date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    }).sort({ delivery_date: -1 });

    res.json({
      status: "success",
      customer: {
        _id: customer._id,
        cname: customer.cname,
        cphone_number: customer.cphone_number,
        caddress: customer.caddress,
        bottle_price: customer.bottle_price,
        delivery_sequence_number: customer.delivery_sequence_number,
        phone_verification_status: customer.phone_verification_status,
      },
      entries,
    });
  } catch (error) {
    console.error("Error fetching customer dashboard:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard data",
    });
  }
};

// Middleware to protect customer routes
export const protectCustomer = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Please login to access this resource",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (decoded.type !== "customer") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token type",
      });
    }

    req.customer = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};
