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
    let query = req.user.is_admin ? {} : { uid: req.user.id };

    // Add month filter support
    const { month, year, filter } = req.query;

    console.log("📅 Payment Filter Request:", {
      filter,
      month,
      year,
      userId: req.user.id,
    });

    // Fetch all payments first, then filter in JavaScript since payment_date is stored as String
    const allpaymentdetails = await PaymentDetail.find(query)
      .populate("cid")
      .populate("uid", "fname lname email phone_number")
      .sort({ createdAt: -1 });

    console.log(
      `📊 Total payments found before filtering: ${allpaymentdetails.length}`
    );

    let filteredPayments = allpaymentdetails;

    if (
      filter === "last_month" ||
      (month !== undefined && year !== undefined)
    ) {
      const now = new Date();
      let targetMonth, targetYear;

      if (filter === "last_month") {
        // Get last month
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        targetMonth = lastMonth.getMonth();
        targetYear = lastMonth.getFullYear();
        console.log("📅 Last Month Filter:", { targetMonth, targetYear });
      } else {
        targetMonth = parseInt(month);
        targetYear = parseInt(year);
        console.log("📅 Custom Month Filter:", { targetMonth, targetYear });
      }

      // Filter payments by month and year
      filteredPayments = allpaymentdetails.filter((payment) => {
        const paymentDate = new Date(payment.payment_date);
        return (
          paymentDate.getMonth() === targetMonth &&
          paymentDate.getFullYear() === targetYear
        );
      });

      console.log(
        `📅 Filtered to ${filteredPayments.length} payments for month ${
          targetMonth + 1
        }/${targetYear}`
      );
    } else if (filter === "this_month") {
      // Get this month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      console.log("📅 This Month Filter:", {
        month: currentMonth,
        year: currentYear,
      });

      // Filter payments by current month and year
      filteredPayments = allpaymentdetails.filter((payment) => {
        const paymentDate = new Date(payment.payment_date);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      });

      console.log(
        `� Filtered to ${filteredPayments.length} payments for current month ${
          currentMonth + 1
        }/${currentYear}`
      );
    } else {
      console.log("📅 No Filter Applied - All Time");
    }

    console.log(`✅ Returning ${filteredPayments.length} payment records`);

    res.json({ data: filteredPayments, status: "success" });
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ message: error.message, status: "error" });
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
    const payment = await PaymentDetail.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment entry not found",
        status: "error",
      });
    }

    // Check if user has permission to update
    if (!req.user.is_admin && payment.uid.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this payment",
        status: "error",
      });
    }

    const updateData = {};
    if (req.body.cid) updateData.cid = req.body.cid;
    if (req.body.amount) updateData.amount = req.body.amount;
    if (req.body.payment_date) updateData.payment_date = req.body.payment_date;
    if (req.body.payment_status)
      updateData.payment_status = req.body.payment_status;
    if (req.body.payment_method)
      updateData.payment_method = req.body.payment_method;

    const updatedPaymentEntry = await PaymentDetail.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("cid");

    res.json({ data: updatedPaymentEntry, status: "success" });
  } catch (error) {
    console.error("Error updating payment entry:", error);
    res.status(500).json({
      message: error.message || "Error updating payment entry",
      status: "error",
    });
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
