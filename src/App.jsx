/* eslint-disable react/no-children-prop */
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SignIn from "./Components/UI/UI-Components/SignIn";
import SignUp from "./Components/UI/UI-Components/SignUp";
import { Dashboard } from "./Components/Section/Dashboard";
import Customers from "./Components/Section/Customers";
import SettingsProfilePage from "./Components/Section/forms/MainPage";
import SettingsLayout from "./Components/Section/forms/layout";
import SettingsShopDetailsPage from "./Components/Section/forms/shopdeatis/page";
import SettingsBankDetailsPage from "./Components/Section/forms/bankdetails/page";
import SettingsNotificationsPage from "./Components/Section/forms/notifications/page";
import SettingsAppearancePage from "./Components/Section/forms/appearance/page";
import SettingsSecurityPage from "./Components/Section/forms/security/page";
import CustomerEntry from "./Components/Section/CustomerEntry";
import CustomerEntryData from "./Components/Section/CustomerEntryData";
import { ThemeProvider } from "./Context/ThemeProviderContext ";
import Invoice from "./Components/Section/Invoice";
import { useEffect, useState } from "react";
import Error from "./Components/Section/404";
import ComingSoonPage from "./Components/Section/ComingSoonPage";
import UnderConstructionPage from "./Components/Section/UnderConstructionPage";
import Invoicex from "./Components/Section/Invoicex";
import PaymentDetails from "./Components/Section/PaymentDetails";
import PaymentsEntryData from "./Components/Section/PaymentsEntryData";
import LandingPage from "./Components/Section/LandingPage";
import { SkeletonTheme } from "react-loading-skeleton";
import AdminLayout from "./Components/Admin/AdminLayout";
import InquiryDashboard from "./Components/Admin/InquiryDashboard";
import EnhancedAdminDashboard from "./Components/Admin/EnhancedAdminDashboard";
import EnhancedUserManagement from "./Components/Admin/EnhancedUserManagement";
import ActivityLogs from "./Components/Admin/ActivityLogs";
import SystemSettings from "./Components/Admin/SystemSettings";
import ReportsGeneration from "./Components/Admin/ReportsGeneration";
import AdminPaymentReview from "./Components/Admin/AdminPaymentReview";
import PartyOrders from "./Components/Section/PartyOrders";
import UserProvider from "./Context/UserContext";
import AdminCustomerManagement from "./Components/Admin/AdminCustomerManagement";
import ReactGA from "react-ga4";
import { config } from "./Data/config";
import CustomerDashboard from "./Components/Section/CustomerDashboard";
import AutoInvoiceSettings from "./Components/Section/AutoInvoiceSettings";
import OfflinePage from "./Components/Section/OfflinePage";

// Initialize Google Analytics
const GA_TRACKING_ID = config.GA_tracking_id;
if (GA_TRACKING_ID) {
  ReactGA.initialize(GA_TRACKING_ID);
}

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever route changes
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
}

function App() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      console.log("App is now ONLINE");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("App is now OFFLINE");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show offline page when not connected
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <>
      <UserProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <SkeletonTheme
            baseColor={`${mediaQuery.matches ? "#1c1c1c" : ""}`}
            highlightColor={`${mediaQuery.matches ? "#525252" : ""}`}
          >
            <BrowserRouter>
              <PageTracker />
              <Routes>
                {/* User Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signupdp" element={<SignUp />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customerentry" element={<CustomerEntry />} />
                <Route
                  path="/customerentrydata"
                  element={<CustomerEntryData />}
                />
                <Route path="/paymentdetails" element={<PaymentDetails />} />
                <Route path="/paymentsdata" element={<PaymentsEntryData />} />
                <Route path="/invoice" element={<Invoice />} />
                <Route path="/invoicex" element={<Invoicex />} />
                <Route
                  path="/inquirydashboard"
                  element={<InquiryDashboard />}
                />
                <Route path="/partyorders" element={<PartyOrders />} />

                {/* Customer Portal Routes */}
                <Route
                  path="/customerportal/dashboard"
                  element={<CustomerDashboard />}
                />

                {/* Admin Routes */}
                <Route path="/admin/" element={<AdminLayout />}>
                  <Route
                    path="dashboard"
                    element={<EnhancedAdminDashboard />}
                  />
                  <Route path="users" element={<EnhancedUserManagement />} />
                  <Route
                    path="customers"
                    element={<AdminCustomerManagement />}
                  />
                  <Route path="payments" element={<AdminPaymentReview />} />
                  <Route path="inquiries" element={<InquiryDashboard />} />
                  <Route path="reports" element={<ReportsGeneration />} />
                  <Route path="activity-logs" element={<ActivityLogs />} />
                  <Route path="settings" element={<SystemSettings />} />

                  <Route path="*" element={<UnderConstructionPage />} />
                </Route>
                {/* <Route path="/admindashboard" element={<AdminDashboard />} />
              <Route path="/admincustomers" element={<Customers />} />
              <Route path="/admincustomerentry" element={<CustomerEntry />} /> */}
                <Route
                  path="/admincustomerentrydata"
                  element={<CustomerEntryData />}
                />
                <Route
                  path="/adminpaymentdetails"
                  element={<PaymentDetails />}
                />
                <Route
                  path="/adminpaymentsdata"
                  element={<PaymentsEntryData />}
                />

                {/* Common Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/profile"
                  element={
                    <SettingsLayout children={<SettingsProfilePage />} />
                  }
                />
                <Route
                  path="/shopdetails"
                  element={
                    <SettingsLayout children={<SettingsShopDetailsPage />} />
                  }
                />
                <Route
                  path="/bankdetails"
                  element={
                    <SettingsLayout children={<SettingsBankDetailsPage />} />
                  }
                />
                <Route
                  path="/notifications-settings"
                  element={
                    <SettingsLayout children={<SettingsNotificationsPage />} />
                  }
                />
                <Route
                  path="/appearance"
                  element={
                    <SettingsLayout children={<SettingsAppearancePage />} />
                  }
                />
                <Route
                  path="/security"
                  element={
                    <SettingsLayout children={<SettingsSecurityPage />} />
                  }
                />
                <Route
                  path="/auto-invoice"
                  element={
                    <SettingsLayout children={<AutoInvoiceSettings />} />
                  }
                />
                <Route path="/404" element={<Error />} />
                <Route path="/comming-soon" element={<ComingSoonPage />} />
                <Route
                  path="/under-construction"
                  element={<UnderConstructionPage />}
                />

                <Route path="*" element={<Error />} />
              </Routes>
            </BrowserRouter>
          </SkeletonTheme>
        </ThemeProvider>
      </UserProvider>
    </>
  );
}

export default App;
