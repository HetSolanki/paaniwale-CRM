import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Activity, UserCog } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Badge } from "@/Components/UI/shadcn-UI/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/Components/UI/shadcn-UI/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { getadmindashborddata } from "@/Handlers/getadmindashborddata";
import { GetAllUsers } from "@/Handlers/AdminUserManagement";

const Admindashboard = () => {
  const [data, setData] = useState({
    totalRevenue: 129500,
    totalUsers: 24,
    totalCustomers: 156,
    topCustomers: [
      {
        _id: "66ab70e16fa866f34e264fca",
        totalAmount: 480,
        customerName: "Het Solanki",
      },
      {
        _id: "66ab70e16fa866f34e264fca",
        totalAmount: 480,
        customerName: "Het Solanki",
      },
      {
        _id: "66ab70e16fa866f34e264fca",
        totalAmount: 480,
        customerName: "Het Solanki",
      },
      {
        _id: "66ab70e16fa866f34e264fca",
        totalAmount: 480,
        customerName: "Het Solanki",
      },
      {
        _id: "66ab70e16fa866f34e264fca",
        totalAmount: 480,
        customerName: "Het Solanki",
      },
    ],
    revenueGrowthPercent: 12,
    userGrowthPercent: 12,
    customerGrowthPercent: 12,
    revenueThisMonth: 129500,
  });

  const [recentUsers, setRecentUsers] = useState([
    {
      name: "John Doe",
      role: "Admin",
      email: "john@gmail.com",
      status: "Active",
      _id: "1234567890",
    }
  ]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getadmindashborddata();
        const users = await GetAllUsers();
        // console.log(users);
        if (users.status === "success") {
          const mappedUsers = users.data.map((user) => ({
            name: `${user.fname} ${user.lname}`,
            role: user.is_admin ? "Admin" : "User",
            status: "Active",
            email: user.email,
            _id: user._id,
          }));

          setRecentUsers(mappedUsers);  
          // console.log("Recent Users:", mappedUsers);        
        } else {
          console.error("Error fetching users:", users);
        }
        // console.log(response);
        if (response.status === 200) {
          setData(response.data);
        } else {
          console.error("Error fetching data:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Search functionality for customers

  const [customerSearch, setCustomerSearch] = useState("");
  const filteredCustomers = (data?.topCustomers ?? []).filter((customer) =>
    customer.customerName?.toLowerCase().includes(customerSearch.toLowerCase())
  );
  // console.log(data);
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">
          Welcome back. Here&#39;s what&#39;s happening today.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {!loading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                Revenue
                <Activity className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{data?.totalRevenue || 0}
              </div>
              <p
                className={`text-sm flex items-center mt-1 ${
                  data?.revenueGrowthPercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data?.revenueGrowthPercent >= 0 ? "+" : "-"}
                {Math.abs(data?.revenueGrowthPercent).toFixed(2)}%{" "}
                <span className="ml-1 text-gray-500 text-xs">
                  from last month
                </span>
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="p-0">
                View details
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[140px] w-full rounded-md" />
        )}
        {/* Users Card */}
        {!loading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                Users
                <UserCog className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalUsers || 0}</div>
              <p
                className={`text-sm flex items-center mt-1 ${
                  data?.userGrowthPercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data?.userGrowthPercent >= 0 ? "+" : "-"}
                {Math.abs(data?.userGrowthPercent).toFixed(2)}%{" "}
                <span className="ml-1 text-gray-500 text-xs">
                  from last month
                </span>
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="p-0" onClick={() => {
                navigate("/admin/users");
              }}>
                Manage users
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[140px] w-full rounded-md" />
        )}
        {!loading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                Customers
                <Users className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.totalCustomers || 0}
              </div>
              <p
                className={`text-sm flex items-center mt-1 ${
                  data?.customerGrowthPercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data?.customerGrowthPercent >= 0 ? "+" : "-"}
                {Math.abs(data?.customerGrowthPercent).toFixed(2)}%{" "}
                <span className="ml-1 text-gray-500 text-xs">
                  from last month
                </span>
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="p-0" 
              onClick={() => {
                navigate("/admin/customers");
              }}                
              >
                Manage customers
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[140px] w-full rounded-md" />
        )}

        {!loading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                Revenue This Month
                <Activity className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{data?.revenueThisMonth || 0}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="p-0">
                View details
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[140px] w-full rounded-md" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Revenue Customers */}
        {!loading ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <h4 className="font-medium">Top Customers</h4>
                </CardTitle>
                {/* Search bar for customers */}
              </div>

              <CardDescription>
                Top 5 customers generating highest revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="justify-between items-center mb-4">
                <div className="flex items-center">
                  <Input
                    placeholder="Search customers"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full"
                  />
                  <div className="ml-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem>
                          Send promotional offers
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View detailed report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {customer.customerName}
                      </TableCell>
                      <TableCell>₹{customer.totalAmount}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                View All Customers
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[400px] w-full rounded-md" />
        )}

        {/* User Management Section */}
        {!loading ? (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                System users and their activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Active Users</h4>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add User
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.slice(0, 4).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active" ? "outline" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              ...
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View activity</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Disable
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                navigate("/admin/users");
              }}>
                Manage All Users
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Skeleton className="h-[400px] w-full rounded-md</Button>" />
        )}
      </div>
    </>
  );
};

export default Admindashboard;
