import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Avatar, AvatarFallback } from "@/Components/UI/shadcn-UI/avatar";
import { Skeleton } from "@/Components/UI/shadcn-UI/skeleton";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Ban,
  CheckCircle2,
  Package,
  Calendar,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import axios from "axios";
import { format } from "date-fns";

export default function AdminCustomerManagement() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEntriesDialogOpen, setIsEntriesDialogOpen] = useState(false);
  const [customerEntries, setCustomerEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterStatus]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/customers/customeralladmin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/stats/customers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCustomerEntries = async (customerId) => {
    try {
      setLoadingEntries(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/customerentry/getallcustomerentryadmin/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setCustomerEntries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer entries",
        variant: "destructive",
      });
    } finally {
      setLoadingEntries(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.cname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.cphone_number?.toString().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.caddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((customer) =>
        filterStatus === "active"
          ? customer.status === "active"
          : customer.status === "inactive"
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/${
          selectedCustomer._id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
      fetchStats();

      logActivity(
        "customer_deleted",
        `Deleted customer: ${selectedCustomer.cname}`
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = customer.status === "active" ? "inactive" : "active";

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/${
          customer._id
        }/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: `Customer ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
      });

      fetchCustomers();
      logActivity(
        "customer_updated",
        `Changed status of ${customer.cname} to ${newStatus}`
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const handleViewEntries = (customer) => {
    setSelectedCustomer(customer);
    setIsEntriesDialogOpen(true);
    fetchCustomerEntries(customer._id);
  };

  const handleExportCustomers = () => {
    const csv = [
      [
        "Name",
        "Phone",
        "Email",
        "Address",
        "Status",
        "Bottle Price",
        "Created At",
      ],
      ...filteredCustomers.map((customer) => [
        customer.cname || "",
        customer.cphone_number || "",
        customer.email || "",
        customer.caddress || "",
        customer.status || "active",
        customer.bottle_price || 0,
        new Date(customer.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Customers exported successfully",
    });

    logActivity("export_data", "Exported customers to CSV");
  };

  const logActivity = async (type, description) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/activity-log`,
        {
          type,
          description,
          ipAddress: "127.0.0.1",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <Badge variant="default">{status}</Badge>;
      case "pending":
        return <Badge variant="secondary">{status}</Badge>;
      case "processing":
      case "in-progress":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status || "pending"}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View customers and their bottle delivery entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCustomers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Customers"
          value={stats.total}
          icon={Users}
          subtitle="All registered customers"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle2}
          subtitle="Active customers"
          iconColor="text-green-600"
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          icon={Ban}
          subtitle="Inactive customers"
          iconColor="text-red-600"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          subtitle="All-time revenue"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          icon={TrendingUp}
          subtitle="Per customer"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, email, or address..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>
            Showing {filteredCustomers.length} of {customers.length} total
            customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Bottle Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {customer.cname?.charAt(0).toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {customer.cname || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {customer._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.cphone_number || "N/A"}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">
                          {customer.caddress || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(customer.bottle_price || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "active" ? "default" : "secondary"
                        }
                      >
                        {customer.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.createdAt
                        ? format(new Date(customer.createdAt), "MMM dd, yyyy")
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewEntries(customer)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Entries
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(customer)}
                          >
                            {customer.status === "active" ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information about the customer
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">
                    {selectedCustomer.cname || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    {selectedCustomer.cphone_number || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">
                    {selectedCustomer.email || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={
                      selectedCustomer.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedCustomer.status || "active"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-muted-foreground">
                    Address
                  </Label>
                  <p className="font-medium">
                    {selectedCustomer.caddress || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Bottle Price
                  </Label>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(selectedCustomer.bottle_price || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Sequence Number
                  </Label>
                  <p className="font-medium">
                    {selectedCustomer.delivery_sequence_number || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Joined Date
                  </Label>
                  <p className="font-medium">
                    {selectedCustomer.createdAt
                      ? format(new Date(selectedCustomer.createdAt), "PPP")
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                handleViewEntries(selectedCustomer);
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Entries Dialog */}
      <Dialog open={isEntriesDialogOpen} onOpenChange={setIsEntriesDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEntriesDialogOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>
                  Bottle Entries - {selectedCustomer?.cname}
                </DialogTitle>
                <DialogDescription>
                  All bottle delivery entries for this customer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {loadingEntries ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customerEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries found for this customer</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {customerEntries.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Bottles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {customerEntries.reduce(
                        (sum, e) => sum + (e.bottle_count || 0),
                        0
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        customerEntries.reduce(
                          (sum, e) =>
                            sum +
                            (e.bottle_count || 0) *
                              (selectedCustomer?.bottle_price || 0),
                          0
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bottles</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {entry.delivery_date || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.bottle_count} bottles
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(
                            (entry.bottle_count || 0) *
                              (selectedCustomer?.bottle_price || 0)
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry.delivery_status)}
                      </TableCell>
                      <TableCell>
                        {entry.createdAt
                          ? format(
                              new Date(entry.createdAt),
                              "MMM dd, yyyy HH:mm"
                            )
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEntriesDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCustomer?.cname}? This
              will also delete all their entries and payment records. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon: Icon, subtitle, iconColor }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  subtitle: PropTypes.string,
  iconColor: PropTypes.string,
};
