import Razorpay from "razorpay";
import process from "process";

// Create a new payment link

export const createPaymentLink = async (req, res) => {
  // Initialize Razorpay inside the function to ensure env vars are loaded
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET_KEY,
  });

  const {
    amount,
    description,
    customer_email,
    customer_name,
    customer_phone,
    smsnotify,
    emailnotify,
    reminder_enable,
  } = req.body;

  const options = {
    amount: amount * 100, // Razorpay amount is in paise
    currency: "INR",
    description,
    customer: {
      email: customer_email,
      name: customer_name,
      contact: "+91" + customer_phone,
    },
    notify: {
      sms: smsnotify,
      email: emailnotify,
    },
    reminder_enable: reminder_enable,
    options: {
      checkout: {
        name: customer_name,
        description: description,
        prefill: {
          name: customer_name,
          email: customer_email,
          contact: "+91" + customer_phone,
        },
        theme: {
          color: "#F37254",
        },
        display: {
          logo: "https://ibb.co/GkRsF7q",
        },
        readonly: {
          email: true,
          contact: true,
        },
        show_preferences: {
          issued_to: true,
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        redirect: true,
      },
    },
  };

  try {
    const response = await razorpay.paymentLink.create(options);

    if (response) {
      res.json({ data: response, status: "success" });
    } else {
      res.json({ data: "Payment Link creation failed", status: "error" });
    }
  } catch (error) {
    res.json({ data: error.message, status: "error", error: error });
  }
};
