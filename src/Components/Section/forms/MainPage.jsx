import { useNavigate } from "react-router-dom";
import { ProfileForm } from "./profile-form";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../UI/shadcn-UI/card";
import { User } from "lucide-react";

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Profile Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Manage your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
