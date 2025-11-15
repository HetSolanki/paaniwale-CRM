import { main } from "../Module/cloudinaryHandler.js";
import Customer from "../Schema/customer.js";
import customerEntry from "../Schema/customerEntry.js";
import PaymentDetail from "../Schema/PaymentDetail.js";

export const getAllCustomer = async (req, res) => {
  try {
    const allCustomers = await Customer.find({ uid: req.user.id })
      .sort({ delivery_sequence_number: 1 })
      .populate("uid");

    if (!allCustomers) {
      return res.json({ data: "No Customer Found", status: "failed" });
    }

    res.json({ data: allCustomers, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const getallCustomerAdmin = async (req, res) => {
  try {
    const allCustomers = await Customer.find()
      .sort({
        delivery_sequence_number: 1,
      })
      .populate("uid");

    if (!allCustomers) {
      return res.json({ data: "No Customer Found", status: "failed" });
    }

    const totalspentamount = await PaymentDetail.aggregate([
      {
        $group: {
          _id: "$cid",
          total: { $sum: "$amount" },
        },
      },
    ]);
    console.log(totalspentamount);
    res.json({ data: allCustomers, totalspentamount, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const getOneCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.json({ data: "No Customer Found", status: "failed" });
    }

    res.json({ data: customer, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create({
      uid: req.body.uid,
      cname: req.body.cname,
      cphone_number: req.body.cphone_number,
      caddress: req.body.caddress,
      bottle_price: req.body.bottle_price,
      delivery_sequence_number: req.body.delivery_sequence_number,
      phone_verification_status: req?.body?.phone_verification_status || false,
    });
    res.json({ data: newCustomer, status: "success" });
  } catch (error) {
    console.error("Error creating customer:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: "error",
        message: `A customer with this ${
          field === "cphone_number" ? "phone number" : field
        } already exists for this user.`,
        field: field,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Generic error
    res.status(500).json({
      status: "error",
      message: "Failed to create customer. Please try again.",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        cname: req.body.cname,
        cphone_number: req.body.cphone_number,
        caddress: req.body.caddress,
        bottle_price: req.body.bottle_price,
        delivery_sequence_number: req.body.delivery_sequence_number,
        phone_verification_status: req.body.phone_verification_status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    res.json({ data: updatedCustomer, status: "success" });
  } catch (error) {
    console.error("Error updating customer:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: "error",
        message: `A customer with this ${
          field === "cphone_number" ? "phone number" : field
        } already exists for this user.`,
        field: field,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Generic error
    res.status(500).json({
      status: "error",
      message: "Failed to update customer. Please try again.",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    await customerEntry.deleteMany({ cid: req.params.id });
    await PaymentDetail.deleteMany({ cid: req.params.id });

    if (!deletedCustomer) {
      return res.json({ data: "No Customer Found", status: "failed" });
    }

    res.json({ data: deletedCustomer, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    // Get all customers
    const allCustomers = await Customer.find();
    const total = allCustomers.length;

    // Calculate total revenue from all payments
    const payments = await PaymentDetail.find();
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    // Get customers with recent activity (payments in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentPayments = await PaymentDetail.find({
      createdAt: { $gte: ninetyDaysAgo },
    }).distinct("cid");

    const active = recentPayments.length;
    const inactive = total - active;

    // Calculate average order value
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    const stats = {
      total,
      active,
      inactive,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100, // Round to 2 decimals
    };

    res.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    res
      .status(500)
      .json({ message: "Error fetching customer stats", error: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    // console.log(req.params.publicid);
    const obj = main(req.params.publicid);
    res.json({ message: obj });
  } catch (error) {
    res.json({ message: "Hello World!!" });
  }
};
