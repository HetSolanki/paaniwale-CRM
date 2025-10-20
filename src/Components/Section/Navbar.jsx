import { Link } from "react-router-dom";
import {
  CircleUser,
  FilePlus2,
  Home,
  BarChart3,
  Package,
  UsersRound,
} from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/Components/UI/shadcn-UI/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { NAVBAR } from "@/Data/Navbar";
import { useUser } from "@/Context/UserContext";
import { NavbarItems } from "./NavbarItems";
import { ModeToggle } from "../UI/UI-Components/ModeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("cid");
    }
    navigate("/");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 h-16 justify-between items-center gap-4 border-b bg-background/50 z-50 backdrop-blur-lg px-4 md:px-6">
        <nav className="flex flex-row items-center gap-5 text-sm lg:gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {(user && user.shop_name) || "Your Company"}
            </h4>
          </Link>
          <NavbarItems />
        </nav>
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <ModeToggle />
          <span className="hidden sm:block text-sm">
            Hey 👋, {user?.uid?.fname || "Your Name"} {user?.uid?.lname}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 flex h-14 items-center justify-between gap-4 border-b bg-background/50 z-40 backdrop-blur-lg px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
            {user ? user?.shop_name : "Your Company"}
          </h4>
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-9 w-9"
              >
                <CircleUser className="h-4 w-4" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Instagram-like) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/50 backdrop-blur-lg z-40">
        <div className="flex h-full items-center justify-around">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive("/dashboard")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Home"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 truncate px-1">Home</span>
          </Link>

          <Link
            to="/customers"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive("/customers")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Customers"
          >
            <UsersRound className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 truncate px-1">Customers</span>
          </Link>

          <Link
            to="/customerentry"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive("/customerentry")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Customer Entry"
          >
            <FilePlus2 className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 truncate px-1">Entries</span>
          </Link>

          <Link
            to="/paymentdetails"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive("/paymentdetails")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Payment Details"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 truncate px-1">Payments</span>
          </Link>

          <button
            onClick={() => navigate("/partyorders")}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive("/partyorders")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Party Orders"
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 truncate px-1">Orders</span>
          </button>
        </div>
      </nav>

      {/* Add padding to body on mobile to prevent content overlap */}
      <style>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
