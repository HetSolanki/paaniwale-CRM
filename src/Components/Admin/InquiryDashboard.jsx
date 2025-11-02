import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/shadcn-UI/card";
import { Badge } from "../UI/shadcn-UI/badge";
import { Button } from "../UI/shadcn-UI/button";

const InquiryDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchInquiryStats = useCallback(async () => {
    try {
      const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(`${DOMAIN_NAME}/api/inquiry/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch inquiry stats:", error);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      let url = `${DOMAIN_NAME}/api/inquiry/all`;
      if (filter !== "all") {
        url = `${DOMAIN_NAME}/api/inquiry/status/${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data.data.inquiries);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInquiryStats();
    fetchInquiries();
  }, [fetchInquiryStats, fetchInquiries]);

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${DOMAIN_NAME}/api/inquiry/${inquiryId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchInquiries(); // Refresh the list
        fetchInquiryStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Failed to update inquiry status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "sales":
        return "bg-purple-100 text-purple-800";
      case "demo":
        return "bg-blue-100 text-blue-800";
      case "support":
        return "bg-red-100 text-red-800";
      case "partnership":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inquiry Management</h1>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.new || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.resolved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {["all", "new", "contacted", "resolved", "closed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inquiries found
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <Card
              key={inquiry._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {inquiry.subject}
                      </h3>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                      <Badge className={getTypeColor(inquiry.inquiryType)}>
                        {inquiry.inquiryType}
                      </Badge>
                      <Badge className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <strong>Name:</strong> {inquiry.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {inquiry.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {inquiry.phone}
                      </div>
                    </div>

                    {inquiry.company && (
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Company:</strong> {inquiry.company}
                      </div>
                    )}

                    <div className="text-sm text-gray-700 mb-3">
                      <strong>Message:</strong> {inquiry.message}
                    </div>

                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(inquiry.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {inquiry.status === "new" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry._id, "contacted")
                        }
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Mark Contacted
                      </Button>
                    )}

                    {(inquiry.status === "new" ||
                      inquiry.status === "contacted") && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry._id, "resolved")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Resolved
                      </Button>
                    )}

                    {inquiry.status === "resolved" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry._id, "closed")
                        }
                        variant="outline"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                {inquiry.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <strong className="text-sm text-gray-600">
                      Admin Notes:
                    </strong>
                    <p className="text-sm text-gray-700 mt-1">
                      {inquiry.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InquiryDashboard;
