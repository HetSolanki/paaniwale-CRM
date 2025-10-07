import { createJWT, hashPassword } from "../Module/auth.js";
import User from "../Schema/user.js";
import { comparePassword } from "../Module/auth.js";
import customer from "../Schema/customer.js";
import PaymentDetail from "../Schema/PaymentDetail.js";
import customerEntry from "../Schema/customerEntry.js";

export const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find({});

    if (allUsers.length === 0) {
      return res.json({ data: "No User Found", status: "failed" });
    }

    res.json({ data: allUsers, status: "success" });
  } catch (error) {
    res.json({ message: "Error" });
  }
};

export const getOneUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ data: user, status: "success" });
};

export const createUser = async (req, res) => {
  try {
    if (await User.findOne({ phone_number: req.body.phone_number })) {
      return res.json({ data: "User Already Exists", status: "failed" });
    }

    const newUser = await User.create({
      fname: req.body.fname,
      lname: req.body.lname,
      phone_number: req.body.phone_number,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      is_admin: req.body.is_admin,
    });

    const token = createJWT(newUser);
    res.json({ token, status: "success", cid: newUser._id });
  } catch (error) {
    res.json({ error });
  }
};

export const updateUser = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      fname: req.body.fname,
      lname: req.body.lname,
      phone_number: req.body.phone_number,
      email: req.body.email,
      // password: await hashPassword(req.body.password),
    },
    { new: true }
  );
  res.json({ data: updatedUser, status: "success" });
};

export const updateBankDetails = async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    {
      bank_details: {
        branch_ifsc_code: req.body.branch_ifsc_code,
        account_number: req.body.account_number,
        benificiary_name: req.body.benificiary_name,
      },
    },
    { new: true }
  );

  res.json({ data: updated, status: "success" });
};

export const deleteUser = async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  const customerid = await customer.find({ uid: req.params.id });

  customerEntry.deleteMany({ cid: customerid._id });
  PaymentDetail.deleteMany({ cid: customerid._id });

  customer.deleteMany({ uid: req.params.id });

  if (!deletedUser) {
    return res.json({ data: "User not found", status: "failed" });
  }

  res.json({ data: deletedUser, status: "success" });
};

export const signIn = async (req, res) => {
  try {
    const user = await User.findOne({ phone_number: req.body.phone_number });

    if (user) {
      if (await comparePassword(req.body.password, user.password)) {
        const token = createJWT(user);
        res.json({
          token,
          success: true,
          userid: user._id,
          is_admin: user.is_admin,
        });
      } else {
        res.json({ data: "Invalid Credentials", status: "failed" });
      }
    } else {
      res.json({ data: "Invalid Phone Number", status: "failed" });
    }
  } catch (error) {
    res.json({ error });
  }
};

export const getAdmindashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await customer.countDocuments();

    const totalrevenue = await PaymentDetail.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue =
      totalrevenue.length > 0 ? totalrevenue[0].totalRevenue : 0;

    const topCustomers = await customer.aggregate([
      {
        $lookup: {
          from: "paymentdetails",
          localField: "_id",
          foreignField: "cid",
          as: "payments",
        },
      },
      {
        $unwind: "$payments",
      },
      {
        $group: {
          _id: "$_id",
          totalAmount: { $sum: "$payments.amount" },
          customerName: { $first: "$cname" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });
    const customersLastMonth = await customer.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const customersThisMonth = await customer.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const calcPercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const userGrowthPercent = calcPercentChange(usersThisMonth, usersLastMonth);
    const customerGrowthPercent = calcPercentChange(
      customersThisMonth,
      customersLastMonth
    );

    const revenueLastMonthAgg = await PaymentDetail.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const revenueThisMonthAgg = await PaymentDetail.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const revenueLastMonth =
      revenueLastMonthAgg.length > 0 ? revenueLastMonthAgg[0].total : 0;
    const revenueThisMonth =
      revenueThisMonthAgg.length > 0 ? revenueThisMonthAgg[0].total : 0;
    const revenueGrowthPercent = calcPercentChange(
      revenueThisMonth,
      revenueLastMonth
    );

    res.json({
      totalUsers,
      totalCustomers,
      totalRevenue,
      topCustomers,
      revenueGrowthPercent,
      userGrowthPercent,
      customerGrowthPercent,
      usersThisMonth,
      usersLastMonth,
      customersThisMonth,
      customersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
    });
  } catch (error) {
    res.json({ error });
  }
};
