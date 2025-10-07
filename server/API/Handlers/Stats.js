import User from "../Schema/user.js";
import CustomerEntry from "../Schema/customerEntry.js";
import PaymentDetail from "../Schema/PaymentDetail.js";
import Customer from "../Schema/customer.js";

// Get client/user statistics
export const getClientStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Count active users (users who have customers)
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "userId",
          as: "customers",
        },
      },
      {
        $match: {
          customers: { $ne: [] },
        },
      },
      {
        $count: "activeUsers",
      },
    ]);

    const activeUserCount =
      activeUsers.length > 0 ? activeUsers[0].activeUsers : 0;

    res.json({
      status: "success",
      data: {
        totalUsers,
        totalCustomers,
        activeUsers: activeUserCount,
        count: totalUsers, // For backward compatibility
      },
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch client statistics",
      error: error.message,
    });
  }
};

// Get invoice statistics
export const getInvoiceStats = async (req, res) => {
  try {
    const totalInvoices = await CustomerEntry.countDocuments();

    // Count invoices by status if you have status field
    const invoicesByMonth = await CustomerEntry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $limit: 12,
      },
    ]);

    // Calculate this month's invoices
    const currentMonth = new Date();
    const thisMonthInvoices = await CustomerEntry.countDocuments({
      createdAt: {
        $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
        $lt: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          1
        ),
      },
    });

    res.json({
      status: "success",
      data: {
        totalInvoices,
        thisMonthInvoices,
        invoicesByMonth,
        count: totalInvoices, // For backward compatibility
      },
    });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch invoice statistics",
      error: error.message,
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await PaymentDetail.countDocuments();

    // Calculate total amount if you have amount field
    const paymentSummary = await PaymentDetail.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Count successful payments (if you have status field)
    const successfulPayments = await PaymentDetail.countDocuments({
      status: { $in: ["completed", "success", "paid"] },
    });

    const summary =
      paymentSummary.length > 0
        ? paymentSummary[0]
        : {
            totalAmount: 0,
            totalCount: totalPayments,
            avgAmount: 0,
          };

    res.json({
      status: "success",
      data: {
        totalPayments,
        successfulPayments,
        totalAmount: summary.totalAmount || 0,
        averageAmount: summary.avgAmount || 0,
        count: totalPayments, // For backward compatibility
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch payment statistics",
      error: error.message,
    });
  }
};

// Get general statistics (all combined)
export const getGeneralStats = async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalCustomers,
      totalInvoices,
      totalPayments,
      thisMonthInvoices,
      successfulPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      CustomerEntry.countDocuments(),
      PaymentDetail.countDocuments(),
      CustomerEntry.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      PaymentDetail.countDocuments({
        status: { $in: ["completed", "success", "paid"] },
      }),
    ]);

    // Calculate growth metrics
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthInvoices = await CustomerEntry.countDocuments({
      createdAt: {
        $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
      },
    });

    const invoiceGrowth =
      lastMonthInvoices > 0
        ? (
            ((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      status: "success",
      data: {
        users: {
          total: totalUsers,
          active: Math.floor(totalUsers * 0.75), // Estimate active users
        },
        customers: {
          total: totalCustomers,
        },
        invoices: {
          total: totalInvoices,
          thisMonth: thisMonthInvoices,
          lastMonth: lastMonthInvoices,
          growth: `${invoiceGrowth}%`,
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          successRate:
            totalPayments > 0
              ? `${((successfulPayments / totalPayments) * 100).toFixed(1)}%`
              : "0%",
        },
        // For landing page compatibility
        totalClients: totalUsers,
        invoicesSent: totalInvoices,
        paymentsProcessed: totalPayments,
      },
    });
  } catch (error) {
    console.error("Error fetching general stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch general statistics",
      error: error.message,
    });
  }
};
