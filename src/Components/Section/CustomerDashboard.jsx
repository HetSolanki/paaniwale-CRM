import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import {
  LogOut,
  User,
  Phone,
  MapPin,
  Wine,
  IndianRupee,
  Calendar,
  Package,
} from "lucide-react";
import { config } from "@/Data/config";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import Skeleton from "react-loading-skeleton";

export default function CustomerDashboard() {
  const [customerData, setCustomerData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customer");
      return;
    }

    fetchCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(
        `${config.baseUrl}/api/customerportal/portal/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setCustomerData(data.customer);
        setEntries(data.entries || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch data",
        });

        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerPhone");
    navigate("/");
  };

  const totalBottles = entries.reduce(
    (sum, entry) => sum + (entry.bottle_count || 0),
    0
  );
  const totalAmount = customerData
    ? totalBottles * customerData.bottle_price
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto space-y-6 py-8">
          <Skeleton height={100} />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </div>
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back!
            </h1>
            <p className="text-muted-foreground mt-1">
              View your account details and delivery history
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Customer Details Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your registered details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold capitalize">
                    {customerData?.cname || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-semibold">
                    {customerData?.cphone_number || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-semibold">
                    {customerData?.caddress || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
                  <IndianRupee className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bottle Price</p>
                  <p className="font-semibold">
                    ₹{customerData?.bottle_price || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-teal-100 dark:bg-teal-900 p-2">
                  <Wine className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Sequence
                  </p>
                  <p className="font-semibold">
                    #{customerData?.delivery_sequence_number || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-pink-100 dark:bg-pink-900 p-2">
                  <Package className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Account Status
                  </p>
                  <Badge
                    variant={
                      customerData?.phone_verification_status
                        ? "default"
                        : "secondary"
                    }
                  >
                    {customerData?.phone_verification_status
                      ? "Verified"
                      : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bottles
              </CardTitle>
              <Wine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBottles}</div>
              <p className="text-xs text-muted-foreground">
                Current month deliveries
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding balance
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Delivery History
            </CardTitle>
            <CardDescription>Your recent delivery entries</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No delivery entries found
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Bottles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow key={entry._id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          {entry.delivery_date
                            ? format(
                                new Date(entry.delivery_date),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Wine className="h-4 w-4 text-muted-foreground" />
                            {entry.bottle_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.delivery_status === "Delivered"
                                ? "default"
                                : entry.delivery_status === "Absent"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {entry.delivery_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹
                          {entry.bottle_count *
                            (customerData?.bottle_price || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
