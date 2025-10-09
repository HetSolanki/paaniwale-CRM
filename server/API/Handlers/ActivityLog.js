import ActivityLog from "../Schema/ActivityLog.js";

// Create activity log
export const createActivityLog = async (req, res) => {
  try {
    const { type, description, ipAddress, severity, metadata } = req.body;
    const userId = req.user.id;
    const username = req.user.username || `user_${req.user.id}`;

    const activityLog = new ActivityLog({
      userId,
      username,
      type,
      description,
      ipAddress: ipAddress || req.ip || req.connection.remoteAddress,
      severity: severity || getSeverityFromType(type),
      metadata,
    });

    await activityLog.save();

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activityLog,
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log activity",
      error: error.message,
    });
  }
};

// Get all activity logs with filters
export const getAllActivityLogs = async (req, res) => {
  try {
    const {
      type,
      userId,
      severity,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};

// Get activity log statistics
export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalActivities,
      activityByType,
      activityBySeverity,
      topUsers,
      recentActivities,
    ] = await Promise.all([
      ActivityLog.countDocuments(dateFilter),
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$userId",
            username: { $first: "$username" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      ActivityLog.find(dateFilter)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalActivities,
        activityByType,
        activityBySeverity,
        topUsers,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity statistics",
      error: error.message,
    });
  }
};

// Delete old activity logs (for cleanup)
export const deleteOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting old logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete old logs",
      error: error.message,
    });
  }
};

// Helper function to determine severity from activity type
function getSeverityFromType(type) {
  const severityMap = {
    user_login: "low",
    user_logout: "low",
    user_created: "medium",
    user_updated: "medium",
    user_deleted: "high",
    customer_created: "low",
    customer_updated: "low",
    customer_deleted: "medium",
    order_created: "low",
    order_updated: "low",
    order_deleted: "medium",
    payment_created: "medium",
    payment_approved: "medium",
    payment_rejected: "high",
    payment_updated: "medium",
    inquiry_created: "low",
    inquiry_updated: "low",
    settings_changed: "high",
    export_data: "medium",
    system_error: "critical",
    login_failed: "medium",
    password_changed: "high",
    other: "low",
  };

  return severityMap[type] || "low";
}
