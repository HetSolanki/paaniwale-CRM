/* eslint-disable react/prop-types */
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
import { Loader2, Pencil } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { editcustomer } from "@/Handlers/EditcustomerHandler";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomer } from "@/Hooks/fetchCustomer";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "../shadcn-UI/use-toast";
import { Toaster } from "../shadcn-UI/toaster";
import { useRef, useState } from "react";
import { config } from "@/Data/config";

const formSchema = z.object({
  cname: z.string().min(1, {
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
    .string()
    .min(1, { message: "Delivery sequence number is required" })
    .regex(/^\d+$/, {
      message: "Only digits are allowed",
    }),
});

export function Editcustomer({ id }) {
  const customerDetails = useQuery({
    queryKey: ["customerDetail", id],
    queryFn: fetchCustomer,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
  });

  if (!customerDetails.isLoading) {
    var {
      cname,
      caddress,
      cphone_number,
      delivery_sequence_number,
      bottle_price,
    } = customerDetails.data.data;
  }

  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const formSubmit = async (data) => {
    try {
      setClick(true);
      const newcustomer = await editcustomer(data, id);

      if (newcustomer.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast({
          title: "Success",
          description: "Customer details updated successfully.",
        });
        clearfield();
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            newcustomer.message || "Failed to update customer details.",
        });
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setClick(false);
    }
  };
  const clearfield = () => {
    form.reset();
    setIsVerified(false);
    setOtpSent(false);
    setOtp("");
    setPhoneChanged(false);
  };

  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [originalPhone, setOriginalPhone] = useState("");
  const [phoneChanged, setPhoneChanged] = useState(false);
  let otpgenerated = useRef(null);

  // Set original phone number when customer data loads
  if (!customerDetails.isLoading && originalPhone === "") {
    setOriginalPhone(String(cphone_number));
  }

  // Check if phone number has changed
  const checkPhoneChange = (newPhone) => {
    const hasChanged = newPhone !== originalPhone;
    setPhoneChanged(hasChanged);
    if (!hasChanged) {
      // If phone number is reverted to original, no need for verification
      setIsVerified(true);
      setOtpSent(false);
      setOtp("");
    } else {
      // If phone number changed, require verification
      setIsVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

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
        onOpenChange={(open) => {
          if (!open) {
            clearfield();
          }
        }}
        open={open}
      >
        <DialogTrigger asChild>
          <div
            className="cursor-pointer items-center"
            onClick={() => setOpen(true)}
          >
            <Pencil />
          </div>
        </DialogTrigger>
        <DialogContent className="w-[90%] sm:max-w-[425px] rounded-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(formSubmit)}>
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>
                  Fill in the form below to edit customer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="cname"
                    defaultValue={cname}
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
                <div className="grid gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="cphone_number"
                    defaultValue={String(cphone_number)}
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
                              onChange={(e) => {
                                field.onChange(e);
                                checkPhoneChange(e.target.value);
                              }}
                            />
                            {phoneChanged && !isVerified && !otpSent && (
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
                  {otpSent && !isVerified && phoneChanged && (
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
                  {isVerified && phoneChanged && (
                    <div className="text-green-600 text-xs mt-1">
                      ✓ Phone number verified
                    </div>
                  )}
                </div>
                <div className="grid gap-2 items-center ">
                  <FormField
                    control={form.control}
                    name="caddress"
                    defaultValue={caddress}
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
                    defaultValue={bottle_price?.toString()}
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
                    defaultValue={delivery_sequence_number?.toString()}
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
              <DialogFooter className="flex-row flex justify-between gap-y-2 sm:gap-y-0">
                {!click ? (
                  <Button
                    type="submit"
                    className="font-semibold"
                    disabled={phoneChanged && !isVerified}
                  >
                    Update Customer
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
      </Dialog>
      <Toaster />
    </>
  );
}
