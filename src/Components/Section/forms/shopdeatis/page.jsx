import { useNavigate } from "react-router-dom";
import { ShopForm } from "./Shopdetails-form";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../UI/shadcn-UI/card";
import { Store } from "lucide-react";

export default function SettingsAccountPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Shop Details
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Update your shop information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ShopForm />
        </CardContent>
      </Card>
    </div>
  );
}
