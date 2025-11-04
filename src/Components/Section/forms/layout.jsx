/* eslint-disable react/prop-types */
import Navbar from "../Navbar";
import { SidebarNav } from "./components/sidebar-nav";
import {
  User,
  Store,
  Shield,
  Palette,
  CreditCard,
  CalendarClock,
} from "lucide-react";
import { Toaster } from "../../UI/shadcn-UI/toaster";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    title: "Shop Details",
    href: "/shopdetails",
    icon: Store,
    description: "Update your shop information",
  },
  {
    title: "Bank Details",
    href: "/bankdetails",
    icon: CreditCard,
    description: "Configure payment methods",
  },
  {
    title: "Auto Invoice",
    href: "/auto-invoice",
    icon: CalendarClock,
    description: "Schedule automatic invoice sending",
  },
  // {
  //   title: "Notifications",
  //   href: "/notifications-settings",
  //   icon: Bell,
  //   description: "Manage notification preferences",
  // },
  {
    title: "Appearance",
    href: "/appearance",
    icon: Palette,
    description: "Customize theme and display",
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
    description: "Password and security settings",
  },
];

export default function SettingsLayout({ children }) {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Mobile-Optimized Container */}
        <div className="pb-6 sm:pb-8">
          {/* Header Section - Mobile Optimized */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          {/* Settings Content */}
          <div className="sm:px-6 sm:pt-6">
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
              {/* Sidebar Navigation - Mobile: Horizontal Tabs, Desktop: Vertical Sidebar */}
              <aside className="w-full lg:w-64 shrink-0">
                <SidebarNav items={sidebarNavItems} />
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0 px-4 pt-4 sm:px-0 sm:pt-0">
                <div className="max-w-3xl">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
