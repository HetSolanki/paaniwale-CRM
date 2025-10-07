import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/Components/UI/shadcn-UI/dialog";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn-UI/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addcustomer } from "@/Handlers/AddcustomerHandler";
import { useCustomer } from "@/Context/CustomerContext";
import { useUser } from "@/Context/UserContext";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "../shadcn-UI/toaster";
import { useToast } from "../shadcn-UI/use-toast";
import { useRef, useState } from "react";
import { config } from "@/Data/meta";

const formSchema = z.object({
  cname: z
    .string({
      message: "Customer name is required",
    })
    .min(1, {
      message: "Customer name is required",
    }),
  cphone_number: z
    .string({ message: "Phone number is required" })
    .length(10, { message: "Phone number must contains excatly 10 digits" })
    .regex(/^\d{10}$/, "Phone number must only contain digits"),
  caddress: z.string().min(1, { message: "Customer address is required" }),
  bottle_price: z
    .string()
    .min(1, { message: "Bottle price is required" })
    .regex(/^\d+$/, {
      message: "Only digits are allowed",
    }),
  delivery_sequence_number: z
    .string({ message: "Delivery sequence number is required" })
    .min(1, { message: "Delivery sequence number is required" })
    .regex(/^\d+$/, {
      message: "Only digits are allowed",
    }),
});

export function Addcustomer() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const { updateCustomerContext } = useCustomer();
  const [click, setClick] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const formSubmit = async (data) => {
    setClick(true);
    const newcustomer = await addcustomer(data, user.uid._id);

    if (newcustomer.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This number is already in use.",
      });
    }
    if (newcustomer.status === "success") {
      toast({
        title: "Success",
        description: "Customer added successfully.",
      });
      setClick(false);
      updateCustomerContext();
      form.reset();
    }
  };

  const clearfield = () => {
    form.reset();
  };

  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  let otpgenerated = useRef(null);

  const handleSendOtp = async (phone) => {
    try {
      otpgenerated.current = Math.floor(100000 + Math.random() * 900000);
      const res =
        (await fetch(
          `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: config.whatsapp.authorization, // Use your access token
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: `91${phone}`,
              type: "template",
              template: {
                name: "otp_verification",
                language: {
                  code: "en_US",
                },
                components: [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: `${otpgenerated.current}`,
                      },
                    ],
                  },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                      {
                        type: "text",
                        text: `${otpgenerated.current}`,
                      },
                    ],
                  },
                ],
              },
            }),
          }
        )) ?? {};

      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message!",
        });
        throw new Error(`Error: ${data.error.message}`);
      } else {
        toast({
          title: "Success",
          description: "OTP sent successfully!",
        });
      }
      setOtpSent(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
      return;
    }

    toast({ title: "OTP Sent", description: `OTP sent to ${phone}` });
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
      if (otp.length === 6 && Number(otp) === Number(otpgenerated.current)) {
        setIsVerified(true);
        toast({
          title: "Success",
          description: "Phone number verified successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid OTP. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Dialog
        onOpenChange={() => {
          clearfield();
          setIsVerified(false);
          setOtpSent(false);
          setOtp("");
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Customer
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90%] sm:max-w-[425px] rounded-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(formSubmit)}>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Fill in the form below to add a new customer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="cname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="cname" className="font-semibold">
                          Customer Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="cname"
                            type="text"
                            placeholder="Customer Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="cphone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="cphone_number"
                          className="font-semibold"
                        >
                          Customer Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              id="cphone_number"
                              type="text"
                              placeholder="Customer Phone Number"
                              {...field}
                              disabled={isVerified}
                            />
                            {!otpSent && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={async () => {
                                  const valid = await form.trigger(
                                    "cphone_number"
                                  );
                                  if (valid) {
                                    handleSendOtp(
                                      form.getValues("cphone_number")
                                    );
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "Invalid Phone",
                                      description:
                                        "Enter valid phone number first.",
                                    });
                                  }
                                }}
                              >
                                Send OTP
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {otpSent && !isVerified && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        maxLength={6}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyOtp}
                        disabled={verifying || otp.length !== 6}
                      >
                        {verifying ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                  )}
                  {isVerified && (
                    <div className="text-green-600 text-xs mt-1">
                      Phone number verified
                    </div>
                  )}
                </div>
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="caddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="caddress" className="font-semibold">
                          Customer Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="caddress"
                            type="text"
                            placeholder="Customer Address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="bottle_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="bottle_price"
                          className="font-semibold"
                        >
                          Bottle Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="bottle_price"
                            type="text"
                            placeholder="Bottle Price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="delivery_sequence_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="delivery_sequence_number"
                          className="font-semibold"
                        >
                          Delivery Sequence Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="delivery_sequence_number"
                            type="text"
                            placeholder="Delivery Sequence Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter className="flex-row flex justify-between">
                {!click ? (
                  <Button
                    type="submit"
                    className="font-semibold"
                    disabled={!isVerified}
                    title={!isVerified ? "Verify phone number first" : ""}
                  >
                    Add Customer
                  </Button>
                ) : (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
        <Toaster />
      </Dialog>
    </>
  );
}
