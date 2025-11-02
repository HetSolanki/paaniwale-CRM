import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../shadcn-UI/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { Input } from "../shadcn-UI/input";
import { Label } from "../shadcn-UI/label";
import { Badge } from "../shadcn-UI/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/Context/UserContext";
import {
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "../shadcn-UI/use-toast";
import { Toaster } from "../shadcn-UI/toaster";
import { signinuser } from "@/Handlers/SignInHandler";

const formSchema = z.object({
  phone_number: z
    .string({
      message: "Phone Number is required",
    })
    .min(10, {
      message: "Phone Number must be of 10 digits",
    })
    .max(10, {
      message: "Phone Number must be of 10 digits",
    })
    .regex(/^[0-9]*$/, {
      message: "Phone Number must be numeric",
    }),
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    })
    .max(20, {
      message: "Password must be at most 20 characters",
    })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/^(?=.*[a-z])/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least one number",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character",
    }),
});

export default function SignIn() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: localStorage.getItem("phone_number") || "",
      password: localStorage.getItem("password") || "",
    },
  });

  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [click, setClick] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const formSubmit = async (data) => {
    try {
      setClick(true);
      const signin = await signinuser(data);

      if (signin.success === true) {
        localStorage.setItem("token", signin.token);

        refetchUser();

        toast({
          title: "Success",
          description: "Logged in successfully!",
        });

        if (signin.is_admin === true) {
          localStorage.setItem("is_admin", signin.is_admin);
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 800);
        } else {
          localStorage.setItem("is_admin", signin.is_admin);
          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        }
      } else if (signin.data === "Invalid Credentials") {
        toast({
          variant: "destructive",
          title: "Login Error",
          description:
            "Invalid Credentials. Please check your phone number and password.",
        });
      } else if (signin.data === "Invalid Phone Number") {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "Invalid Phone Number. Please check and try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description:
            signin.message || signin.data || "An unexpected error occurred",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Failed to sign in. Please try again.",
      });
    } finally {
      setClick(false);
    }
  };

  const [rmCheck, setRmCheck] = useState("true");

  const handlecheckchange = (e) => {
    setRmCheck(e.target.checked);
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Back Button - Fixed Position */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>

        {/* Left Side - Branding & Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
            {/* Logo/Brand */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold mb-4 text-center">
                Welcome Back! 👋
              </h1>
              <p className="text-xl text-blue-100 text-center max-w-md">
                Sign in to manage your business efficiently with our powerful
                dashboard
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-6 max-w-md w-full">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Real-time Analytics
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Track your business performance with live data
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Customer Management
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Manage customers, orders, and deliveries seamlessly
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Business Growth</h3>
                    <p className="text-blue-100 text-sm">
                      Insights and reports to grow your business
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 text-center">
              <Badge className="bg-white/20 text-white hover:bg-white/30 px-6 py-2 text-sm border border-white/30">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Secure & Encrypted
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-gray-600">Sign in to continue</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(formSubmit)}>
                <Card className="border-0 shadow-2xl">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      Sign In
                    </CardTitle>
                    <CardDescription className="text-base">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {/* Phone Number Field */}
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="phone_number"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="font-semibold text-gray-700 text-base">
                                Phone Number
                              </Label>
                              <FormControl>
                                <Input
                                  name="phone_number"
                                  placeholder="Enter your 10-digit phone number"
                                  {...field}
                                  className={`h-12 text-base ${
                                    form.formState.errors.phone_number
                                      ? "border-red-500 focus:ring-red-500"
                                      : "border-gray-300 focus:ring-blue-500"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="font-semibold text-gray-700 text-base">
                                Password
                              </Label>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...field}
                                    className={`h-12 text-base pr-12 ${
                                      form.formState.errors.password
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                          <input
                            type="checkbox"
                            id="remember"
                            value="remember"
                            checked={rmCheck}
                            onChange={handlecheckchange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                        {/* <Link 
                          to="/forgot-password" 
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Forgot password?
                        </Link> */}
                      </div>

                      {/* Submit Button */}
                      {!click ? (
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Sign In
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-12 text-base font-semibold"
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </Button>
                      )}

                      {/* Divider */}
                      {/* <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-4 text-gray-500">Or continue with</span>
                        </div>
                      </div> */}

                      {/* Google Sign In - Commented for now */}
                      {/* <Button 
                        variant="outline" 
                        type="button"
                        className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Sign in with Google
                      </Button> */}
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Sign up now
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>

            {/* Mobile Trust Badge */}
            <div className="lg:hidden text-center mt-8">
              <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Secure & Encrypted
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
