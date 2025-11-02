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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Avatar, AvatarFallback } from "@/Components/UI/shadcn-UI/avatar";
import {
  Search,
  Download,
  RefreshCw,
  Activity,
  User,
  ShoppingCart,
  CreditCard,
  Settings,
  Trash2,
  Edit,
  UserPlus,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/Components/UI/shadcn-UI/skeleton";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import axios from "axios";
import { format } from "date-fns";

export default function ActivityLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    byType: [],
    bySeverity: [],
    topUsers: [],
  });
  const [filterUser, setFilterUser] = useState("all");

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filterType, filterSeverity, dateFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Build query parameters
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterSeverity !== "all") params.append("severity", filterSeverity);
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate = new Date();
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        params.append("startDate", startDate.toISOString());
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/activity-log/all?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
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
        `${import.meta.env.VITE_API_BASE_URL}/api/activity-log/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setStats({
          total: response.data.data.totalActivities,
          byType: response.data.data.activityByType,
          bySeverity: response.data.data.activityBySeverity,
          topUsers: response.data.data.topUsers,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Type", "Description", "IP Address", "Severity"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.user,
        log.type,
        log.description,
        log.ipAddress,
        log.severity,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Activity logs exported successfully",
    });
  };

  const getActivityIcon = (type) => {
    if (type.includes("login")) return <LogIn className="h-4 w-4" />;
    if (type.includes("logout")) return <LogOut className="h-4 w-4" />;
    if (type.includes("user")) return <User className="h-4 w-4" />;
    if (type.includes("customer")) return <ShoppingCart className="h-4 w-4" />;
    if (type.includes("payment")) return <CreditCard className="h-4 w-4" />;
    if (type.includes("order")) return <ShoppingCart className="h-4 w-4" />;
    if (type.includes("settings")) return <Settings className="h-4 w-4" />;
    if (type.includes("export")) return <Download className="h-4 w-4" />;
    if (type.includes("error")) return <AlertCircle className="h-4 w-4" />;
    if (type.includes("created")) return <UserPlus className="h-4 w-4" />;
    if (type.includes("updated")) return <Edit className="h-4 w-4" />;
    if (type.includes("deleted")) return <Trash2 className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
      default:
        return "default";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and user actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              All recorded activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter((log) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return log.timestamp >= today;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Logs from today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => log.severity === "error").length}
            </div>
            <p className="text-xs text-muted-foreground">Error occurrences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.user)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="customer">Customer Actions</SelectItem>
                <SelectItem value="payment">Payment Actions</SelectItem>
                <SelectItem value="order">Order Actions</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {[...new Set(logs.map((log) => log.user))].map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} total logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {log.user.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(log.type)}
                        <span className="text-sm">
                          {log.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{log.description}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.details}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{log.ipAddress}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
