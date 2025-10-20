import { Link } from "react-router-dom";
import { CircleUser, Menu } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { NAVBAR } from "@/Data/Navbar";
import { useUser } from "@/Context/UserContext";
import { NavbarItems } from "./NavbarItems";
import { ModeToggle } from "../UI/UI-Components/ModeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  return (
    <>
      <header className="sticky top-0 flex h-16 justify-between sm:justify-normal items-center gap-4 border-b bg-background/50 z-50 backdrop-blur-lg px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base "
          >
            <h4
              className="scroll-m-20 text-xl font-semibold tracking-tight w-max"
              id="titleheading"
            >
              {(user && user.shop_name) || "Your Company"}
            </h4>
          </Link>
          <NavbarItems />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="/"
                className="flex items-center border-b-2 border-b-black/50 gap-2 text-lg font-semibold"
              >
                <h4
                  className="scroll-m-20 text-lg font-semibold tracking-tight w-28"
                  id="titleheading"
                >
                  {user ? user?.shop_name : "Your Company"}
                </h4>
              </Link>
              {NAVBAR.map((item, index) => (
                <Link
                  to={item.link}
                  className="text-foreground text-[16px] font-normal transition-colors hover:text-foreground"
                  key={index}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex sm:hidden">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base "
          >
            <h4
              className="scroll-m-20 text-xl font-semibold tracking-tight w-max"
              id="titleheading"
            >
              {user ? user?.shop_name : "Your Company"}
            </h4>
          </Link>
        </div>
        <div className="flex sm:items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <ModeToggle />
          <span className="hidden sm:block">
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
              <DropdownMenuItem
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Settings
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Support</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (localStorage.getItem("token")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("cid");
                  }
                  navigate("/");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};

export default Navbar;
