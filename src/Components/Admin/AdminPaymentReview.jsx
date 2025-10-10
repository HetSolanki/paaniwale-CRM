import { useEffect, useState } from "react";
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
import { Textarea } from "@/Components/UI/shadcn-UI/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Components/UI/shadcn-UI/avatar";
import { Skeleton } from "@/Components/UI/shadcn-UI/skeleton";
import {
  Search,
  Download,
  RefreshCw,
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import axios from "axios";
import { format } from "date-fns";

export default function AdminPaymentReview() {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setPayments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
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
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/stats`,
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

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.cid?.cname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.cid?.cphone_number?.toString().includes(searchTerm) ||
          payment.transaction_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_status === filterStatus
      );
    }

    // Sort by date (pending first, then by created date)
    filtered.sort((a, b) => {
      if (a.payment_status === "pending" && b.payment_status !== "pending")
        return -1;
      if (a.payment_status !== "pending" && b.payment_status === "pending")
        return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredPayments(filtered);
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/${
          selectedPayment._id
        }/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Payment approved successfully",
      });

      setIsApproveDialogOpen(false);
      setSelectedPayment(null);
      fetchPayments();
      fetchStats();

      logActivity(
        "payment_approved",
        `Approved payment of ${formatCurrency(selectedPayment.amount)} from ${
          selectedPayment.cid?.cname || "Unknown"
        }`
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to approve payment",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/${
          selectedPayment._id
        }/reject`,
        { reason: rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Payment rejected",
      });

      setIsRejectDialogOpen(false);
      setSelectedPayment(null);
      setRejectionReason("");
      fetchPayments();
      fetchStats();

      logActivity(
        "payment_rejected",
        `Rejected payment of ${formatCurrency(selectedPayment.amount)} from ${
          selectedPayment.cid?.cname || "Unknown"
        }`
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject payment",
        variant: "destructive",
      });
    }
  };

  const handleExportPayments = () => {
    const csv = [
      [
        "Payment ID",
        "Customer",
        "Phone",
        "Amount",
        "Method",
        "Transaction ID",
        "Status",
        "Date",
      ],
      ...filteredPayments.map((payment) => [
        payment._id.slice(-8),
        payment.cid?.cname || "N/A",
        payment.cid?.cphone_number || "N/A",
        payment.amount || 0,
        payment.payment_method || "N/A",
        payment.transaction_id || "N/A",
        payment.payment_status || "pending",
        payment.createdAt
          ? format(new Date(payment.createdAt), "yyyy-MM-dd")
          : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Payments exported successfully",
    });

    logActivity("export_data", "Exported payments to CSV");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getMethodBadge = (method) => {
    const colors = {
      upi: "bg-purple-100 text-purple-700",
      card: "bg-blue-100 text-blue-700",
      netbanking: "bg-green-100 text-green-700",
      cash: "bg-yellow-100 text-yellow-700",
    };

    return colors[method?.toLowerCase()] || "bg-gray-100 text-gray-700";
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve customer payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportPayments}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                payments.filter(
                  (p) => p.status === "approved" || p.status === "completed"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "rejected").length}
            </div>
            <p className="text-xs text-muted-foreground">Declined payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(
                    (p) => p.status === "approved" || p.status === "completed"
                  )
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Approved amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, transaction ID, or payment ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {payments.length} total
            payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow
                    key={payment._id}
                    className={
                      payment.payment_status === "pending" ? "bg-yellow-50" : ""
                    }
                  >
                    <TableCell className="font-medium">
                      #{payment._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {payment.cid?.cname?.charAt(0).toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {payment.cid?.cname || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.cid?.cphone_number || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payment.amount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getMethodBadge(payment.payment_method)}
                        variant="outline"
                      >
                        {payment.payment_method || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transaction_id || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.payment_status)}>
                        {payment.payment_status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {payment.createdAt
                          ? format(new Date(payment.createdAt), "MMM dd, yyyy")
                          : "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.payment_status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about the payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Payment ID
                  </Label>
                  <p className="font-medium">
                    #{selectedPayment._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getStatusColor(selectedPayment.payment_status)}
                    >
                      {selectedPayment.payment_status || "pending"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Customer
                  </Label>
                  <p className="font-medium">
                    {selectedPayment.cid?.cname || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    {selectedPayment.cid?.cphone_number || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Amount
                  </Label>
                  <p className="font-semibold text-green-600 text-lg">
                    {formatCurrency(selectedPayment.amount || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Method
                  </Label>
                  <p className="font-medium">
                    {selectedPayment.payment_method || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="font-mono text-sm">
                    {selectedPayment.transaction_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {selectedPayment.createdAt
                      ? format(new Date(selectedPayment.createdAt), "PPP")
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <p className="font-medium">
                    {selectedPayment.createdAt
                      ? format(new Date(selectedPayment.createdAt), "p")
                      : "Unknown"}
                  </p>
                </div>
                {selectedPayment.screenshot && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">
                      Payment Proof
                    </Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={selectedPayment.screenshot}
                        alt="Payment proof"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">
                      Notes
                    </Label>
                    <p className="font-medium">{selectedPayment.notes}</p>
                  </div>
                )}
                {selectedPayment.rejectionReason && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">
                      Rejection Reason
                    </Label>
                    <p className="font-medium text-red-600">
                      {selectedPayment.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedPayment?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsRejectDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {selectedPayment?.status !== "pending" && (
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Payment Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this payment of{" "}
              {formatCurrency(selectedPayment?.amount || 0)} from{" "}
              {selectedPayment?.customer?.cname}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setSelectedPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprovePayment}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedPayment(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
