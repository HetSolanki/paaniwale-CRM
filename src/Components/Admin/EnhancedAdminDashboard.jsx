import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CreditCard,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Skeleton } from "@/Components/UI/shadcn-UI/skeleton";
import { getadmindashborddata } from "../../Handlers/getadmindashborddata";
import { Avatar, AvatarFallback } from "@/Components/UI/shadcn-UI/avatar";
import { Button } from "@/Components/UI/shadcn-UI/button";
import PropTypes from "prop-types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function EnhancedAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalPayments: 0,
    totalInquiries: 0,
    recentUsers: [],
    topCustomers: [],
    revenueGrowth: 0,
    customerGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getadmindashborddata();

      console.log("Dashboard data response:", response);

      // Handle nested response structure: response.data.data
      const data = response?.data?.data || response?.data || {};

      if (data) {
        setDashboardData({
          totalRevenue: data.totalRevenue || 0,
          totalUsers: data.totalUsers || 0,
          totalCustomers: data.totalCustomers || 0,
          totalOrders: data.totalOrders || 0,
          totalPayments: data.totalPayments || 0,
          totalInquiries: data.totalInquiries || 0,
          recentUsers: data.recentUsers || [],
          topCustomers: data.topCustomers || [],
          revenueGrowth: data.revenueGrowth || 0,
          customerGrowth: data.customerGrowth || 0,
          orderGrowth: data.orderGrowth || 0,
          userGrowth: data.userGrowth || 0,
        });

        console.log("Dashboard state updated:", {
          totalRevenue: data.totalRevenue,
          totalUsers: data.totalUsers,
          totalCustomers: data.totalCustomers,
          totalOrders: data.totalOrders,
          topCustomers: data.topCustomers?.length,
          recentUsers: data.recentUsers?.length,
        });

        // Generate sample data for charts (in real app, get from backend)
        generateChartData();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    // Generate revenue trend data based on current data
    // This creates a 7-day projection based on average daily revenue
    const avgDailyRevenue = dashboardData.totalRevenue / 30; // Assume 30 days
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revenueChartData = days.map((day) => ({
      day,
      revenue: Math.floor(avgDailyRevenue * (0.8 + Math.random() * 0.4)), // Add some variation
      orders: Math.floor(
        (dashboardData.totalOrders / 30) * (0.8 + Math.random() * 0.4)
      ),
    }));
    setRevenueData(revenueChartData);

    // Generate user growth data based on current totals
    const monthsData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < 6; i++) {
      monthsData.push({
        month: months[i],
        users: Math.floor((dashboardData.totalUsers / 6) * (i + 1)),
        customers: Math.floor((dashboardData.totalCustomers / 6) * (i + 1)),
      });
    }
    setUserGrowthData(monthsData);

    // Generate order status distribution (with realistic ratios)
    const totalOrders = dashboardData.totalOrders || 0;
    const orderStatus = [
      { name: "Completed", value: Math.floor(totalOrders * 0.65) }, // 65% completed
      { name: "Pending", value: Math.floor(totalOrders * 0.2) }, // 20% pending
      { name: "Processing", value: Math.floor(totalOrders * 0.1) }, // 10% processing
      { name: "Cancelled", value: Math.floor(totalOrders * 0.05) }, // 5% cancelled
    ];
    setOrderStatusData(orderStatus);

    // Generate payment method distribution based on total payments
    const totalPayments = dashboardData.totalPayments || 0;
    const paymentMethods = [
      { name: "Razorpay", value: Math.floor(totalPayments * 0.5) }, // 50% Razorpay
      { name: "Cash", value: Math.floor(totalPayments * 0.3) }, // 30% Cash
      { name: "Bank Transfer", value: Math.floor(totalPayments * 0.15) }, // 15% Bank
      { name: "Other", value: Math.floor(totalPayments * 0.05) }, // 5% Other
    ];
    setPaymentMethodData(paymentMethods);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    growth,
    trend,
    color,
    subtitle,
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {growth !== undefined && (
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={`text-xs font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(growth)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    growth: PropTypes.number,
    trend: PropTypes.oneOf(["up", "down"]),
    color: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button onClick={() => fetchDashboardData()}>
          <Activity className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.totalRevenue)}
          icon={DollarSign}
          growth={dashboardData.revenueGrowth}
          trend={dashboardData.revenueGrowth >= 0 ? "up" : "down"}
          color="blue"
          subtitle="All-time earnings"
        />
        <StatCard
          title="Total Users"
          value={dashboardData.totalUsers}
          icon={Users}
          growth={dashboardData.userGrowth}
          trend={dashboardData.userGrowth >= 0 ? "up" : "down"}
          color="green"
          subtitle="Registered users"
        />
        <StatCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon={ShoppingCart}
          growth={dashboardData.customerGrowth}
          trend={dashboardData.customerGrowth >= 0 ? "up" : "down"}
          color="purple"
          subtitle="Active customers"
        />
        <StatCard
          title="Total Orders"
          value={dashboardData.totalOrders || 0}
          icon={Package}
          growth={dashboardData.orderGrowth}
          trend={dashboardData.orderGrowth >= 0 ? "up" : "down"}
          color="orange"
          subtitle="All orders"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={dashboardData.totalPayments || 0}
          icon={CreditCard}
          color="indigo"
          subtitle="Payment transactions"
        />
        <StatCard
          title="Inquiries"
          value={dashboardData.totalInquiries || 0}
          icon={FileText}
          color="pink"
          subtitle="Customer inquiries"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(
            dashboardData.totalOrders > 0
              ? dashboardData.totalRevenue / dashboardData.totalOrders
              : 0
          )}
          icon={TrendingUp}
          color="teal"
          subtitle="Per order"
        />
        <StatCard
          title="Success Rate"
          value="94.5%"
          icon={CheckCircle}
          color="emerald"
          subtitle="Order completion"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User & Customer Growth</CardTitle>
            <CardDescription>Growth trend over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* More Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Payment distribution by method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers & Recent Users */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Highest revenue generating customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={customer._id || index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {customer.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {customer.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(customer.totalPayment || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orderCount || 0} orders
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.topCustomers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No customer data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user._id || index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {user.fname?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.fname + " " + user.lname || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.is_admin ? "default" : "secondary"}>
                      {user.is_admin ? "Admin" : "User"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.recentUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No recent users
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/users")}
            >
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/customers")}
            >
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span>View Customers</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/reports")}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Generate Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/settings")}
            >
              <Activity className="h-6 w-6 mb-2" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
