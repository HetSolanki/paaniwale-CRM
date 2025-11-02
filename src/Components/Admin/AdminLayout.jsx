import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Users,
  Settings,
  FileText,
  Home,
  LogOut,
  Bell,
  Search,
  Menu,
  UserCog,
  BarChart4,
  Activity,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import "react-loading-skeleton/dist/skeleton.css";

import { Badge } from "@/Components/UI/shadcn-UI/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";

export default function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePageChange = (page) => {
    setActivePage(page);
    navigate(`/admin/${page}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Button
            variant={activePage === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("dashboard")}
          >
            <Home className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant={activePage === "users" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("users")}
          >
            <UserCog className="mr-2 h-5 w-5" />
            User Management
          </Button>
          <Button
            variant={activePage === "customers" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("customers")}
          >
            <Users className="mr-2 h-5 w-5" />
            Customers Management
          </Button>
          <Button
            variant={activePage === "payments" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("payments")}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Review
          </Button>
          <Button
            variant={activePage === "inquiries" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("inquiries")}
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            Inquiries
          </Button>
          <Button
            variant={activePage === "reports" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("reports")}
          >
            <BarChart4 className="mr-2 h-5 w-5" />
            Reports
          </Button>
          <Button
            variant={activePage === "activity-logs" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("activity-logs")}
          >
            <Activity className="mr-2 h-5 w-5" />
            Activity Logs
          </Button>
          <Button
            variant={activePage === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handlePageChange("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </nav>

        <div className="p-4 mt-auto border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search..."
                className="pl-8 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <FileText
                className="h-4 w-4"
                onClick={() => navigate("/reports")}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium">Notifications</div>
                <div className="p-4 text-sm">
                  <div className="mb-2 pb-2 border-b">
                    <p className="font-medium">New user registered</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                  <div className="mb-2 pb-2 border-b">
                    <p className="font-medium">
                      New bottle order: Customer #1234
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      Low stock alert: Product #5432
                    </p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <UserCog className="h-5 w-5" />
                  <span className="hidden md:inline">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
