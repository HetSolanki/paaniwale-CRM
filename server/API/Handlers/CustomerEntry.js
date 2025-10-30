import mongoose from "mongoose";
import CustomerEntry from "../Schema/customerEntry.js";
import Customer from "../Schema/customer.js";
import PaymentDetail from "../Schema/PaymentDetail.js";
// for admin

export const getAllCustomerEntryAdmin = async (req, res) => {
  try {
    const allCustomerEntry = await CustomerEntry.find({
      cid: req.params.id,
    }).populate("cid");
    if (!allCustomerEntry) {
      return res.json({
        message: "No Customer's Entry Found",
        status: "error",
      });
    }
    // console.log(allCustomerEntry);
    res.json({ data: allCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getAllCustomerEntry = async (req, res) => {
  try {
    const allCustomerEntry = await CustomerEntry.find({
      cid: req.params.id,
      uid: req.user.id,
    })
      .populate("cid")
      .sort({ delivery_date: -1 });
    if (!allCustomerEntry) {
      return res.json({
        message: "No Customer's Entry Found",
        status: "error",
      });
    }
    res.json({ data: allCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getAllCustomerEntrys = async (req, res) => {
  try {
    const allCustomerEntry = await CustomerEntry.find({
      uid: req.user.id,
    }).populate("cid");
    if (!allCustomerEntry) {
      return res.json({
        message: "No any Customer's Entry Found",
        status: "error",
      });
    }
    res.json({ data: allCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getAllCustomerEntryCurrentMonth = async (req, res) => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth() + 1, -28);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  // console.log(firstDay, lastDay);

  try {
    const allCustomerEntry = await CustomerEntry.find({
      // write the query to get the current month's data
      delivery_date: {
        $gte: firstDay,
        $lt: lastDay,
      },
      uid: req.user.id,
    }).populate("cid");
    if (!allCustomerEntry) {
      return res.json({
        message: "No any Customer's Entry Found",
        status: "error",
      });
    }

    if (allCustomerEntry.length === 0) {
      return res.json({
        message: "No any Customer's Entry Found",
        status: "error",
      });
    }

    res.json({ data: allCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

// export const getOneCustomerEntry = async (req, res) => {
//   try {
//     const customerEntry = await CustomerEntry.findById(req.params.id);
//     if (!customerEntry) {
//       return res.json({ message: "No Customer Entry Found", status: "error" });
//     }
//     res.json({ data: customerEntry, status: "success" });
//   } catch (error) {
//     res.json({ message: "Error" });
//   }
// };

export const createCustomerEntry = async (req, res) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.format(new Date());

    const todayStart = new Date(parts);
    todayStart.setHours(0, 0, 0, 0); // Set to start of day

    const todayEnd = new Date(parts);
    todayEnd.setHours(23, 59, 59, 999); // Set to end of day

    // console.log(todayStart, todayEnd);
    const newCustomerEntry = await CustomerEntry.findOneAndUpdate(
      {
        cid: req.body.cid,
        delivery_date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
        uid: req.user.id,
      },
      {
        uid: req.user.id,
        cid: req.body.cid,
        bottle_count: req.body.bottle_count,
        delivery_date: req.body.delivery_date,
        delivery_status: req.body.delivery_status,
      },
      { upsert: true, new: true }
    );

    res.json({ data: newCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ error });
  }
};

export const updateCustomerEntry = async (req, res) => {
  try {
    const updatedCustomerEntry = await CustomerEntry.findByIdAndUpdate(
      req.params.id,
      {
        cid: req.body.cid,
        bottle_count: req.body.bottle_count,
        delivery_date: req.body.delivery_date,
        delivery_status: req.body.delivery_status,
      },
      { new: true }
    );

    if (!updatedCustomerEntry) {
      return res.json({
        message: "Customer Entry not found",
        status: "error",
      });
    }

    res.json({ data: updatedCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: error.message, status: "error" });
  }
};

export const deleteCustomerEntry = async (req, res) => {
  try {
    const deletedCustomerEntry = await CustomerEntry.findByIdAndDelete(
      req.params.id
    );
    if (!deletedCustomerEntry) {
      return res.json({
        message: "No Customer's Entry Found",
        status: "error",
      });
    }
    res.json({ data: deletedCustomerEntry, status: "success" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getCustomerForPayment = async (req, res) => {
  try {
    const allCustomers = await CustomerEntry.aggregate([
      {
        $match: {
          uid: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "cid",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: "$customerData",
      },
      {
        $group: {
          _id: "$cid",
          totalBottle: { $sum: "$bottle_count" },
          customer: { $first: "$customerData" },
        },
      },
      {
        $project: {
          _id: 0,
          cid: "$_id",
          totalBottle: 1,
          customer: 1,
        },
      },
    ]);

    // console.log(allCustomers);
    return res.json({ message: allCustomers, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const getCustomerInvoice = async (req, res) => {
  const date = new Date();
  const firstDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  );
  const lastDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  );

  try {
    const customerEntry = await CustomerEntry.aggregate([
      {
        $match: {
          cid: new mongoose.Types.ObjectId(req.params.id),
          createdAt: {
            $gt: firstDate,
            $lt: lastDate,
          },
          uid: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $sort: {
          delivery_date: 1,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "cid",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $group: {
          _id: "$cid",
          totalBottle: { $sum: "$bottle_count" },
          customerDetails: { $first: "$customerDetails" },
          customerEntry: {
            $push: {
              bottle_count: "$bottle_count",
              delivery_date: "$delivery_date",
              delivery_status: "$delivery_status",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cid: "$_id",
          totalBottle: 1,
          customerDetails: 1,
          customerEntry: 1,
        },
      },
    ]);

    res.json({ data: customerEntry });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getAllCustomerInvoice = async (req, res) => {
  const date = new Date();
  const firstDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  );
  const lastDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  );
  try {
    const customerEntry = await CustomerEntry.aggregate([
      {
        $match: {
          createdAt: {
            $gt: firstDate,
            $lt: lastDate,
          },
          uid: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $sort: {
          createdAt: 1, // Sort by createdAt in descending order
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "cid",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $group: {
          _id: "$cid",
          totalBottle: { $sum: "$bottle_count" },
          customerDetails: { $first: "$customerDetails" },
          customerEntry: {
            $push: {
              bottle_count: "$bottle_count",
              delivery_date: "$delivery_date",
              delivery_status: "$delivery_status",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cid: "$_id",
          totalBottle: 1,
          customerDetails: 1,
          customerEntry: 1,
        },
      },
    ]);

    res.json({ data: customerEntry });
  } catch (error) {
    res.json({ message: error });
  }
};

// export const getdashboardData = async (req, res) => {
//   try {
//     const totalCustomer = await CustomerEntry.aggregate([    cid, payment status, payment
//       {
//         $lookup: {
//           from: "customers",
//           localField: "cid",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $group: {
//           _id: "$cid",
//           totalBottle: { $sum: "$bottle_count" },
//           customerDetails: { $first: "$customerDetails" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           cid: "$_id",
//           totalBottle: 1,
//           customerDetails: 1,
//         },
//       },
//     ]);

//     const totalBottle = totalCustomer.reduce(
//       (acc, current) => acc + current.totalBottle,
//       0
//     );

//     const totalCustomerData = totalCustomer.length;

//     const totalCustomerEntry = await CustomerEntry.find({}).countDocuments();

//     const totalCustomerEntryCurrentMonth = await CustomerEntry.find({
//       delivery_date: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//       },
//     }).countDocuments();

//     res.json({
//       totalCustomer,
//       totalBottle,
//       totalCustomerData,
//       totalCustomerEntry,
//       totalCustomerEntryCurrentMonth,
//     });
//   } catch (error) {
//     res.json({ message: error });
//   }
// };

// export const getdashboardData = async (req, res) => {
//   try {
//     const totalCustomer = await CustomerEntry.aggregate([
//       {
//         $lookup: {
//           from: "customers",
//           localField: "cid",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $addFields: {
//           revenue: { $multiply: ["$bottle_count", "$customerDetails.bottle_price"] },
//         },
//       },
//       {
//         $group: {
//           _id: "$cid",
//           totalBottle: { $sum: "$bottle_count" },
//           totalRevenue: { $sum: "$revenue" },
//           customerDetails: { $first: "$customerDetails" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           cid: "$_id",
//           totalBottle: 1,
//           totalRevenue: 1,
//           customerDetails: 1,
//         },
//       },
//     ]);

//     const totalBottle = totalCustomer.reduce(
//       (acc, current) => acc + current.totalBottle,
//       0
//     );

//     const totalRevenue = totalCustomer.reduce(
//       (acc, current) => acc + current.totalRevenue,
//       0
//     );

//     const totalCustomerData = totalCustomer.length;

//     const totalCustomerEntry = await CustomerEntry.find({}).countDocuments();

//     const totalCustomerEntryCurrentMonth = await CustomerEntry.find({
//       delivery_date: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//         $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//       },
//     }).countDocuments();

//     const monthlyRevenueResult = await CustomerEntry.aggregate([
//       {
//         $match: {
//           delivery_date: {
//             $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//             $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "cid",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $addFields: {
//           revenue: { $multiply: ["$bottle_count", "$customerDetails.bottle_price"] },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$revenue" },
//         },
//       },
//     ]);

//     const monthlyRevenue = monthlyRevenueResult.length ? monthlyRevenueResult[0].totalRevenue : 0;

//     const topCustomers = await CustomerEntry.aggregate([
//       {
//         $lookup: {
//           from: "customers",
//           localField: "cid",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $addFields: {
//           revenue: { $multiply: ["$bottle_count", "$customerDetails.bottle_price"] },
//         },
//       },
//       {
//         $group: {
//           _id: "$cid",
//           totalRevenue: { $sum: "$revenue" },
//           customerDetails: { $first: "$customerDetails" },
//         },
//       },
//       {
//         $sort: { totalRevenue: -1 },
//       },
//       {
//         $limit: 5,
//       },
//       {
//         $project: {
//           _id: 0,
//           cid: "$_id",
//           totalRevenue: 1,
//           customerDetails: 1,
//         },
//       },
//     ]);

//     res.json({
//       totalCustomer,
//       totalBottle,
//       totalRevenue,
//       totalCustomerData,
//       totalCustomerEntry,
//       totalCustomerEntryCurrentMonth,
//       monthlyRevenue,
//       topCustomers,
//     });
//   } catch (error) {
//     res.json({ message: error.message });
//   }
// };

export const getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Total Customers
    const totalCustomerData = await Customer.countDocuments({ uid: userId });

    // Revenue & Sales per Customer
    const customerRevenueData = await CustomerEntry.aggregate([
      { $match: { uid: userId } },
      {
        $lookup: {
          from: "customers",
          localField: "cid",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $addFields: {
          revenue: {
            $multiply: ["$bottle_count", "$customerDetails.bottle_price"],
          },
        },
      },
      {
        $group: {
          _id: "$cid",
          totalBottle: { $sum: "$bottle_count" },
          totalRevenue: { $sum: "$revenue" },
          customerDetails: { $first: "$customerDetails" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Total Bottle & Revenue
    const totalBottle = customerRevenueData.reduce(
      (acc, c) => acc + c.totalBottle,
      0
    );
    const totalRevenue = customerRevenueData.reduce(
      (acc, c) => acc + c.totalRevenue,
      0
    );

    // Top 5 Revenue Customers
    const topCustomers = customerRevenueData.slice(0, 5);

    // Total CustomerEntry count
    const totalCustomerEntry = await CustomerEntry.countDocuments({
      uid: userId,
    });

    // Pending Payment Details
    const pendingPaymentCustomersResult = await PaymentDetail.aggregate([
      { $match: { uid: userId, payment_status: "Pending" } },
      {
        $group: {
          _id: "$cid",
          totalDue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: 0,
          cid: "$_id",
          totalDue: 1,
          customerDetails: 1,
        },
      },
    ]);

    const totalDueAmount = pendingPaymentCustomersResult.reduce(
      (acc, c) => acc + c.totalDue,
      0
    );
    const pendingPaymentCustomersCount = pendingPaymentCustomersResult.length;

    res.json({
      totalCustomer: totalCustomerData,
      totalBottle,
      totalRevenue,
      totalCustomerData,
      totalCustomerEntry,
      topCustomers,
      totalDueAmount,
      pendingPaymentCustomers: pendingPaymentCustomersResult,
      pendingPaymentCustomersCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's entries with customer details
export const getTodayEntries = async (req, res) => {
  try {
    const uid = req.user.id; // Get from auth middleware
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.format(new Date());

    const todayStart = new Date(parts);
    todayStart.setHours(0, 0, 0, 0); // Set to start of day

    const todayEnd = new Date(parts);
    todayEnd.setHours(23, 59, 59, 999); // Set to end of day

    // Single aggregation pipeline - MongoDB does the work!
    const results = await Customer.aggregate([
      // Match only active customers for this user
      {
        $match: {
          uid: new mongoose.Types.ObjectId(uid),
          status: "active",
        },
      },

      // Lookup today's entries
      {
        $lookup: {
          from: "customerentries",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cid", "$$customerId"] },
                    { $gte: ["$delivery_date", todayStart] },
                    { $lte: ["$delivery_date", todayEnd] },
                  ],
                },
              },
            },
          ],
          as: "todayEntry",
        },
      },

      // Add computed fields
      {
        $addFields: {
          hasEntryToday: { $gt: [{ $size: "$todayEntry" }, 0] },
          todayEntryDetails: { $arrayElemAt: ["$todayEntry", 0] },
        },
      },

      // Sort by delivery sequence
      {
        $sort: { delivery_sequence_number: 1 },
      },

      // Project only needed fields
      {
        $project: {
          _id: 1,
          cname: 1,
          cphone_number: 1,
          caddress: 1,
          bottle_price: 1,
          delivery_sequence_number: 1,
          hasEntryToday: 1,
          todayEntryDetails: {
            _id: 1,
            bottle_count: 1,
            delivery_status: 1,
            delivery_date: 1,
          },
        },
      },
    ]);

    // Separate pending and completed
    const pending = results.filter((r) => !r.hasEntryToday);
    const completed = results.filter((r) => r.hasEntryToday);

    // Calculate statistics
    const stats = {
      total: results.length,
      pending: pending.length,
      completed: completed.length,
      totalBottles: completed.reduce(
        (sum, c) => sum + (c.todayEntryDetails?.bottle_count || 0),
        0
      ),
      totalRevenue: completed.reduce(
        (sum, c) =>
          sum + (c.todayEntryDetails?.bottle_count || 0) * c.bottle_price,
        0
      ),
    };

    res.json({
      success: true,
      data: {
        pending,
        completed,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching today entries:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
