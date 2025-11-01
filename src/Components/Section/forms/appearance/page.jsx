import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { Label } from "@/Components/UI/shadcn-UI/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/Components/UI/shadcn-UI/radio-group";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { toast } from "react-toastify";

export default function SettingsAppearancePage() {
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    toast.success("Appearance settings updated successfully", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-100 dark:from-pink-950/50 dark:to-rose-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-pink-600 flex items-center justify-center">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Customize the look and feel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2">Theme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your preferred theme for the interface
              </p>
            </div>

            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="gap-4"
            >
              <Card
                className={`cursor-pointer transition-all ${
                  theme === "light"
                    ? "border-primary shadow-md"
                    : "hover:border-muted-foreground/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="light" id="light" />
                    <Label
                      htmlFor="light"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <Sun className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Light</div>
                        <div className="text-sm text-muted-foreground">
                          Bright and clear
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  theme === "dark"
                    ? "border-primary shadow-md"
                    : "hover:border-muted-foreground/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label
                      htmlFor="dark"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Moon className="h-5 w-5 text-slate-200" />
                      </div>
                      <div>
                        <div className="font-medium">Dark</div>
                        <div className="text-sm text-muted-foreground">
                          Easy on the eyes
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  theme === "system"
                    ? "border-primary shadow-md"
                    : "hover:border-muted-foreground/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="system" id="system" />
                    <Label
                      htmlFor="system"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">System</div>
                        <div className="text-sm text-muted-foreground">
                          Matches your device
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
