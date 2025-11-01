import { Separator } from "@/Components/UI/shadcn-UI/separator";
import { BankdetailsForm } from "./bankdetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { CreditCard } from "lucide-react";

export default function SettingsBankDetailsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-950/50 dark:to-pink-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Bank Details
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Configure your payment methods
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <BankdetailsForm />
        </CardContent>
      </Card>
    </div>
  );
}
