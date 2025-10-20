import Customer from "../Schema/customer.js";
import CustomerEntry from "../Schema/customerEntry.js";
import PaymentDetail from "../Schema/PaymentDetail.js";
import User from "../Schema/user.js";
import Inquiry from "../Schema/inquiry.js";

// Get all admin statistics
export const getAllAdminStats = async (req, res) => {
  try {
    // Customer Stats
    const allCustomers = await Customer.find();
    const activeCustomers = allCustomers.filter(
      (c) => c.status === "active"
    ).length;
    const inactiveCustomers = allCustomers.filter(
      (c) => c.status === "inactive"
    ).length;

    // Customer Entry Stats
    const allEntries = await CustomerEntry.find().populate("cid");
    const pendingEntries = allEntries.filter(
      (e) => e.delivery_status === "pending"
    ).length;
    const completedEntries = allEntries.filter(
      (e) =>
        e.delivery_status === "completed" || e.delivery_status === "delivered"
    ).length;
    const processingEntries = allEntries.filter(
      (e) =>
        e.delivery_status === "processing" ||
        e.delivery_status === "in-progress"
    ).length;

    // Calculate total revenue from entries
    let totalRevenueFromEntries = 0;
    for (const entry of allEntries) {
      if (entry.cid && entry.cid.bottle_price) {
        totalRevenueFromEntries += entry.bottle_count * entry.cid.bottle_price;
      }
    }

    // Payment Stats
    const allPayments = await PaymentDetail.find();
    const totalPaymentAmount = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const pendingPayments = allPayments.filter(
      (p) => p.payment_status === "pending"
    ).length;
    const approvedPayments = allPayments.filter(
      (p) => p.payment_status === "approved" || p.payment_status === "completed"
    ).length;
    const rejectedPayments = allPayments.filter(
      (p) => p.payment_status === "rejected"
    ).length;

    // Payment method breakdown
    const paymentMethods = {
      cash: allPayments.filter((p) => p.payment_method === "cash").length,
      upi: allPayments.filter((p) => p.payment_method === "upi").length,
      card: allPayments.filter((p) => p.payment_method === "card").length,
      netbanking: allPayments.filter((p) => p.payment_method === "netbanking")
        .length,
      bank_transfer: allPayments.filter(
        (p) => p.payment_method === "bank_transfer"
      ).length,
      other: allPayments.filter(
        (p) => p.payment_method === "other" || !p.payment_method
      ).length,
    };

    // User Stats
    const allUsers = await User.find();
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.status === "active").length;
    const adminUsers = allUsers.filter((u) => u.is_admin === true).length;

    // Inquiry Stats
    const allInquiries = await Inquiry.find();
    const newInquiries = allInquiries.filter((i) => i.status === "new").length;
    const resolvedInquiries = allInquiries.filter(
      (i) => i.status === "resolved"
    ).length;

    // Top Customers by Payment
    const customerPayments = await PaymentDetail.aggregate([
      {
        $group: {
          _id: "$cid",
          totalPayment: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
        },
      },
      { $sort: { totalPayment: -1 } },
      { $limit: 5 },
    ]);

    const topCustomers = await Promise.all(
      customerPayments.map(async (cp) => {
        const customer = await Customer.findById(cp._id);
        return {
          ...cp,
          customer: customer
            ? {
                _id: customer._id,
                cname: customer.cname,
                cphone_number: customer.cphone_number,
              }
            : null,
        };
      })
    );

    // Recent Users
    const recentUsers = await User.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select("fname lname email phone_number is_admin timestamp");

    // Growth calculations (compare with last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCustomers = await Customer.find({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentEntries = await CustomerEntry.find({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentPayments = await PaymentDetail.find({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const customerGrowth =
      allCustomers.length > 0
        ? Math.round(
            (recentCustomers.length /
              Math.max(allCustomers.length - recentCustomers.length, 1)) *
              100
          )
        : 0;
    const orderGrowth =
      allEntries.length > 0
        ? Math.round(
            (recentEntries.length /
              Math.max(allEntries.length - recentEntries.length, 1)) *
              100
          )
        : 0;
    const revenueGrowth =
      totalPaymentAmount > 0
        ? Math.round(
            (recentPayments.reduce((sum, p) => sum + p.amount, 0) /
              Math.max(
                totalPaymentAmount -
                  recentPayments.reduce((sum, p) => sum + p.amount, 0),
                1
              )) *
              100
          )
        : 0;

    const stats = {
      // Customer Stats
      totalCustomers: allCustomers.length,
      activeCustomers,
      inactiveCustomers,
      customerGrowth,

      // Order/Entry Stats
      totalOrders: allEntries.length,
      pendingOrders: pendingEntries,
      completedOrders: completedEntries,
      processingOrders: processingEntries,
      orderGrowth,

      // Revenue Stats
      totalRevenue: totalPaymentAmount,
      revenueFromEntries: totalRevenueFromEntries,
      avgOrderValue:
        allEntries.length > 0 ? totalRevenueFromEntries / allEntries.length : 0,
      revenueGrowth,

      // Payment Stats
      totalPayments: allPayments.length,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      paymentMethods,

      // User Stats
      totalUsers,
      activeUsers,
      adminUsers,

      // Inquiry Stats
      totalInquiries: allInquiries.length,
      newInquiries,
      resolvedInquiries,

      // Top Data
      topCustomers: topCustomers.filter((tc) => tc.customer !== null),
      recentUsers,
    };

    res.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      message: "Error fetching admin stats",
      error: error.message,
      status: "error",
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const allCustomers = await Customer.find();
    const total = allCustomers.length;
    const active = allCustomers.filter((c) => c.status === "active").length;
    const inactive = total - active;

    // Calculate total revenue from all payments
    const payments = await PaymentDetail.find();
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    // Calculate average order value
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    const stats = {
      total,
      active,
      inactive,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    };

    res.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    res.status(500).json({
      message: "Error fetching customer stats",
      error: error.message,
      status: "error",
    });
  }
};

// Get customer entry statistics
export const getCustomerEntryStats = async (req, res) => {
  try {
    const allEntries = await CustomerEntry.find().populate("cid");
    const totalOrders = allEntries.length;

    const pendingOrders = allEntries.filter(
      (e) => e.delivery_status === "pending"
    ).length;
    const completedOrders = allEntries.filter(
      (e) =>
        e.delivery_status === "completed" || e.delivery_status === "delivered"
    ).length;
    const processingOrders = allEntries.filter(
      (e) =>
        e.delivery_status === "processing" ||
        e.delivery_status === "in-progress"
    ).length;

    let totalRevenue = 0;
    for (const entry of allEntries) {
      if (entry.cid && entry.cid.bottle_price) {
        totalRevenue += entry.bottle_count * entry.cid.bottle_price;
      }
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      processingOrders,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    };

    res.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching customer entry stats:", error);
    res.status(500).json({
      message: "Error fetching customer entry stats",
      error: error.message,
      status: "error",
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const allPayments = await PaymentDetail.find();
    const total = allPayments.length;

    const pending = allPayments.filter(
      (p) => p.payment_status === "pending"
    ).length;
    const approved = allPayments.filter(
      (p) => p.payment_status === "approved" || p.payment_status === "completed"
    ).length;
    const rejected = allPayments.filter(
      (p) => p.payment_status === "rejected"
    ).length;

    const totalAmount = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const paymentMethods = {
      cash: allPayments.filter((p) => p.payment_method === "cash").length,
      upi: allPayments.filter((p) => p.payment_method === "upi").length,
      card: allPayments.filter((p) => p.payment_method === "card").length,
      netbanking: allPayments.filter((p) => p.payment_method === "netbanking")
        .length,
      bank_transfer: allPayments.filter(
        (p) => p.payment_method === "bank_transfer"
      ).length,
      other: allPayments.filter(
        (p) => p.payment_method === "other" || !p.payment_method
      ).length,
    };

    const stats = {
      total,
      pending,
      approved,
      rejected,
      totalAmount,
      paymentMethods,
    };

    res.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      message: "Error fetching payment stats",
      error: error.message,
      status: "error",
    });
  }
};
