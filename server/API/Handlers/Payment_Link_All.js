import Razorpay from "razorpay";
import process from "process";

export const createPaymentLinkAll = async (req, res) => {
  // Initialize Razorpay inside the function to ensure env vars are loaded
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET_KEY,
  });

  const DOMAIN_NAME = process.env.VITE_API_BASE_URL;

  const allCustomers = await fetch(
    `${DOMAIN_NAME}/api/customerentry/customersforpayment`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const customerResponse = await allCustomers.json();

  try {
    const responses = await Promise.all(
      customerResponse.message.map(async (user) => {
        // console.log("User");
        // console.log(user);
        try {
          const { description, smsnotify, emailnotify, reminder_enable } =
            req.body;

          const options = {
            amount: user.customer.bottle_price * user.totalBottle * 100, // Razorpay amount is in paise
            currency: "INR",
            description,
            customer: {
              email: "",
              name: user.customer.cname,
              contact: "+91" + user.customer.cphone_number,
            },
            notify: {
              sms: smsnotify,
              email: emailnotify,
            },
            reminder_enable: reminder_enable,
            options: {
              checkout: {
                name: user.customer.cname,
                description: description,
                prefill: {
                  name: user.customer.cname,
                  email: "",
                  contact: "+91" + user.customer.cphone_number,
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

          const response = await razorpay.paymentLink.create(options);

          if (response) {
            // console.log(response.customer);
            res.json({ data: response, status: "success" });
          } else {
            res.json({ data: "Payment Link creation failed", status: "error" });
          }
        } catch (error) {
          res.json({ data: error.message, status: "error", error: error });
        }
      })
    );

    if (responses) {
      res.json({ data: responses, status: "success" });
    } else {
      res.json({
        data: "Payment Link creation failed........",
        status: "error",
      });
    }

    res.json({ data: responses, status: "success" });
  } catch (error) {
    res.json({ data: error.message, status: "error", error: error });
  }
};
