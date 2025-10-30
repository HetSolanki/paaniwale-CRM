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
    res.json({ error });
  }
};

export const updateCustomer = async (req, res) => {
  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      cname: req.body.cname,
      cphone_number: req.body.cphone_number,
      caddress: req.body.caddress,
      bottle_price: req.body.bottle_price,
      delivery_sequence_number: req.body.delivery_sequence_number,
      phone_verification_status: req.body.phone_verification_status
    },
    { new: true }
  );

  res.json({ data: updatedCustomer, status: "success" });
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
