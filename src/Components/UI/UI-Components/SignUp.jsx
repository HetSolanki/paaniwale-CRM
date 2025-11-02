import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useForm } from "react-hook-form";
import { Button } from "../shadcn-UI/button";
import { createUser } from "@/Handlers/SignUpHandler";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  // Label,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { Input } from "../shadcn-UI/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "../shadcn-UI/label";
import { useState } from "react";
import { createShop } from "@/Handlers/AddShop";
import { Stack } from "@mui/material";
import {
  ArrowLeft,
  Store,
  UserPlus,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

const steps = ["Sign Up", "Create Display Name", "Complate Sign Up"];

const formSchema = z.object({
  fname: z.string({
    message: "First Name is required",
  }),
  lname: z.string({
    message: "Last Name is required",
  }),
  phone_number: z
    .string({
      message: "Phone Number is required",
    })
    .max(10, {
      message: "Phone Number must be of 10 digits",
    })
    .regex(/^[0-9]*$/, {
      message: "Phone Number must be numeric",
    }),
  email: z.string({
    message: "Email is required",
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
  confirm_password: z.string({
    message: "Confirm Password is required",
  }),
});

const shopSchema = z.object({
  shop_name: z
    .string({ message: "Shop name is required" })
    .min(1, { message: "Shop name is required" }),
  gst_number: z.string().optional(),
});

export default function SignUp() {
  const [currentpage, setCurrentpage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handlepage = (page) => {
    setCurrentpage(page);
  };

  const checkValidation = (data) => {
    if (data.password !== data.confirm_password) {
      form.setError("confirm_password", {
        type: "manual",
        message: "Passwords do not match",
      });
      return false;
    }
    return true;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const shopForm = useForm({
    resolver: zodResolver(shopSchema),
  });

  const shopSubmit = async (data) => {
    const newShop = await createShop(data);

    if (newShop.status === "success") {
      toast.success("Shop-Name Added", {
        position: "top-right",
        autoClose: 2000,
        draggable: true,
        closeOnClick: true,
        theme: "light",
      });
    }
    handlepage(2);
  };

  const formSubmit = async (data) => {
    if (!checkValidation(data)) {
      return;
    }

    const newUser = await createUser(data);

    if (newUser.status === "success") {
      toast.success("Registered Successfully", {
        position: "top-right",
        autoClose: 2000,
        draggable: true,
        closeOnClick: true,
        theme: "light",
      });
      localStorage.setItem("token", newUser.token);
      handlepage(1);
    } else if (newUser.status === "failed") {
      toast.error("User already exists", {
        position: "top-right",
        autoClose: 2000,
        draggable: true,
        closeOnClick: true,
        theme: "light",
      });
    } else {
      toast.error("Error", {
        position: "top-right",
        autoClose: 2000,
        draggable: true,
        closeOnClick: true,
        theme: "light",
      });
    }
  };

  return (
    <>
      {/* Back Button - Fixed Position */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold border border-gray-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Box sx={{ width: "100%" }}>
          <Stack spacing={2}>
            <div className="p-10 ">
              <Box sx={{ width: "100%" }}>
                <Stepper activeStep={currentpage} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </div>
            <div
              className={`${
                currentpage === 0 ? "" : "hidden"
              } flex justify-center items-center p-10`}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(formSubmit)}>
                  <Card className="mx-auto max-w-2xl shadow-2xl border-0">
                    <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900">
                          Create Account
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Enter your information to get started with your business
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="fname"
                              render={({ field }) => (
                                <FormItem>
                                  <Label
                                    htmlFor="first-name"
                                    className="font-semibold text-gray-700 text-base"
                                  >
                                    First name
                                  </Label>
                                  <FormControl>
                                    <Input
                                      id="first-name"
                                      placeholder="John"
                                      {...field}
                                      className={`h-11 ${
                                        form.formState.errors.fname
                                          ? "border-red-500 focus:ring-red-500"
                                          : "border-gray-300 focus:ring-blue-500"
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="lname"
                              render={({ field }) => (
                                <FormItem>
                                  <Label
                                    htmlFor="last-name"
                                    className="font-semibold text-gray-700 text-base"
                                  >
                                    Last name
                                  </Label>
                                  <FormControl>
                                    <Input
                                      id="last-name"
                                      placeholder="Doe"
                                      {...field}
                                      className={`h-11 ${
                                        form.formState.errors.lname
                                          ? "border-red-500 focus:ring-red-500"
                                          : "border-gray-300 focus:ring-blue-500"
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="phone_number"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  Phone Number
                                </Label>
                                <FormControl>
                                  <Input
                                    id="phone_number"
                                    type="text"
                                    placeholder="Enter 10-digit phone number"
                                    {...field}
                                    className={`h-11 ${
                                      form.formState.errors.phone_number
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-2">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="email"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  Email{" "}
                                  <span className="text-gray-400 font-normal">
                                    (Optional)
                                  </span>
                                </Label>
                                <FormControl>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    className="h-11 border-gray-300 focus:ring-blue-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-2">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="password"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  Password
                                </Label>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      id="password"
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Create a strong password"
                                      {...field}
                                      className={`h-11 pr-12 ${
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-2">
                          <FormField
                            control={form.control}
                            name="confirm_password"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="confirm_password"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  Confirm Password
                                </Label>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      id="confirm_password"
                                      type={
                                        showConfirmPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="Re-enter your password"
                                      {...field}
                                      className={`h-11 pr-12 ${
                                        form.formState.errors.confirm_password
                                          ? "border-red-500 focus:ring-red-500"
                                          : "border-gray-300 focus:ring-blue-500"
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword
                                        )
                                      }
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                      ) : (
                                        <Eye className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Create Account
                        </Button>
                        {/* <Button
                        variant="outline"
                        className="w-full font-semibold"
                      >
                        Sign up with GitHub
                      </Button> */}
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                          Already have an account?{" "}
                          <Link
                            to="/signin"
                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Sign in
                          </Link>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
            <div
              className={`${
                currentpage === 1 ? "" : "hidden"
              } flex justify-center items-center p-10`}
            >
              <Form {...shopForm}>
                <form onSubmit={shopForm.handleSubmit(shopSubmit)}>
                  <Card className="mx-auto max-w-md shadow-2xl border-0">
                    <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900">
                          Shop Details
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Set up your business display name
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <FormField
                            control={shopForm.control}
                            name="shop_name"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="shopName"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  Shop Name
                                </Label>
                                <FormControl>
                                  <Input
                                    id="shop_name"
                                    type="text"
                                    placeholder="Enter your shop name"
                                    {...field}
                                    className={`h-11 ${
                                      form.formState.errors.shop_name
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-green-500"
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-2">
                          <FormField
                            control={shopForm.control}
                            name="gst_number"
                            render={({ field }) => (
                              <FormItem>
                                <Label
                                  htmlFor="gst_number"
                                  className="font-semibold text-gray-700 text-base"
                                >
                                  GST Number{" "}
                                  <span className="text-gray-400 font-normal">
                                    (Optional)
                                  </span>
                                </Label>
                                <FormControl>
                                  <Input
                                    id="gst_number"
                                    type="text"
                                    placeholder="Enter GST number"
                                    {...field}
                                    className="h-11 border-gray-300 focus:ring-green-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Save & Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
            <div
              className={`${
                currentpage === 2 ? "" : "hidden"
              } flex justify-center items-center p-10`}
            >
              <Card className="mx-auto max-w-md shadow-2xl border-0">
                <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    🎉 All Set!
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Your account has been created successfully
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                      <p className="text-gray-700 leading-relaxed">
                        Welcome aboard! You&apos;re now ready to start managing
                        your business with powerful tools and insights.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <Button
                        onClick={() => {
                          toast.success("Registered Successfully", {
                            position: "top-right",
                            autoClose: 2000,
                            draggable: true,
                            closeOnClick: true,
                            theme: "light",
                          });
                          setTimeout(() => {
                            navigate("/signin");
                          }, 2000);
                        }}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Continue to Sign In
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Stack>
        </Box>
      </div>
      <ToastContainer />
    </>
  );
}
