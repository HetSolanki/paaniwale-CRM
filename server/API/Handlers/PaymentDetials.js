// import mongoose from "mongoose";
import PaymentDetail from "../Schema/PaymentDetail.js";

export const getAllPaymentDetails = async (req, res) => {
  try {
    const allpaymentdetails = await PaymentDetail.find({
      cid: req.params.id,
      uid: req.user.id,
    }).populate("cid");
    if (!allpaymentdetails) {
      return res.json({
        message: "No Payment Entry Found",
        status: "error",
      });
    }
    // console.log(allpaymentdetails);
    res.json({ data: allpaymentdetails, status: "success" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getAllPaymentEntrys = async (req, res) => {
  try {
    // For admin, get all payments; for regular users, only their payments
    const query = req.user.is_admin ? {} : { uid: req.user.id };

    const allpaymentdetails = await PaymentDetail.find(query)
      .populate("cid")
      .populate("uid", "fname lname email phone_number")
      .sort({ createdAt: -1 });

    if (!allpaymentdetails) {
      return res.json({
        message: "No any Payment Entry Found",
        status: "error",
      });
    }
    res.json({ data: allpaymentdetails, status: "success" });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.json({ message: error.message, status: "error" });
  }
};

export const getAllPaymentDetailsCurrentMonth = async (req, res) => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth() + 1, -28);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  // console.log(firstDay, lastDay);

  try {
    const allpaymentdetails = await PaymentDetail.find({
      // write the query to get the current month's data
      delivery_date: {
        $gte: firstDay,
        $lt: lastDay,
      },
      uid: req.user.id,
    }).populate("cid");
    if (!allpaymentdetails) {
      return res.json({
        message: "No any Payment Entry Found",
        status: "error",
      });
    }

    if (allpaymentdetails.length === 0) {
      return res.json({
        message: "No any Payment Entry Found",
        status: "error",
      });
    }

    res.json({ data: allpaymentdetails, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const createPaymentEntry = async (req, res) => {
  try {
    // Create a new payment entry directly without checking for existing
    const newPaymentEntry = new PaymentDetail({
      cid: req.body.cid,
      uid: req.user.id,
      amount: req.body.amount,
      payment_date: req.body.payment_date,
      payment_status: req.body.payment_status,
      payment_method: req.body.payment_method || "cash",
    });

    await newPaymentEntry.save();

    res.json({ data: newPaymentEntry, status: "success" });
  } catch (error) {
    console.error("Error creating payment entry:", error);
    res.json({ error: error.message, status: "error" });
  }
};

export const updatePaymentEntry = async (req, res) => {
  try {
    const updatedPaymentEntry = await PaymentDetail.findByIdAndUpdate(
      req.params.id,
      {
        cid: req.body.cid,
        amount: req.body.amount,
        payment_date: req.body.payment_date,
        payment_status: req.body.payment_status,
      },
      { new: true }
    );
    res.json({ data: updatedPaymentEntry, status: "success" });
  } catch (error) {
    res.json({ error });
  }
};

export const deletePaymentEntry = async (req, res) => {
  try {
    const deletedPaymentEntry = await PaymentDetail.findByIdAndDelete(
      req.params.id
    );

    if (!deletedPaymentEntry) {
      return res.json({
        message: "No Payment Entry Found",
        status: "error",
      });
    }

    res.json({ data: deletedPaymentEntry, status: "success" });
  } catch (error) {
    res.json({ error });
  }
};
