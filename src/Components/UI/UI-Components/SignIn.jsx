import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/Context/UserContext";
import { Loader2 } from "lucide-react";
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
  const { updateUserContext } = useUser();
  const [click, setClick] = useState(false);
  const { toast } = useToast();

  const formSubmit = async (data) => {
    try {
      setClick(true);
      const signin = await signinuser(data);

      if (signin.success === true) {
        localStorage.setItem("token", signin.token);

        updateUserContext();

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
      <div className="h-screen flex justify-center items-center ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmit)}>
            <Card className="mx-auto max-w-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-[700]">Login</CardTitle>
                <CardDescription>
                  Enter your phone number below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="font-semibold">Phone Number</Label>
                          <FormControl>
                            <Input
                              name="phone_number"
                              {...field}
                              className={
                                form.formState.errors.phone_number
                                  ? "border-red-500"
                                  : ""
                              }
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
                          <Label>
                            <div className="flex items-center">
                              <Label
                                htmlFor="password"
                                className="font-semibold"
                              >
                                Password
                              </Label>
                            </div>
                          </Label>
                          <FormControl>
                            <Input
                              id="password"
                              type="password"
                              {...field}
                              className={
                                form.formState.errors.password
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-x-1">
                    <input
                      type="checkbox"
                      value="remember"
                      checked={rmCheck}
                      onChange={handlecheckchange}
                    />
                    <span className="mb-[.1rem]">Remember me</span>
                  </div>
                  {!click ? (
                    <Button type="submit" className="w-full font-semibold">
                      Sign in
                    </Button>
                  ) : (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  )}
                  {/* <Button variant="outline" className="w-full font-semibold">
                    Signin with Google
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
      <Toaster />
    </>
  );
}
