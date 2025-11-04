"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { useUser } from "@/Context/UserContext";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { updateshop } from "@/Handlers/UpdateShop";
import { useState } from "react";
import { uploadFileCloudinary } from "@/Handlers/uploadFileCloudinary";

const ShopFormSchema = z.object({
  shop_name: z.string().min(1, "Shop name is required"),
  shop_address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .max(100, {
      message: "Address must not be longer than 100 characters.",
    }),
  gst_number: z.string().optional(),
});

export function ShopForm() {
  const { user, refetchUser } = useUser();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(ShopFormSchema),
    defaultValues: {
      shop_name: user?.shop_name || "",
      shop_address: user?.shop_address || "",
      gst_number: user?.gst_number || "",
    },
  });

  const [file, setFile] = useState(null);

  async function onSubmit(data) {
    try {
      let imageUrl = user?.image_url; // Keep existing image by default

      // Only upload new image if file is selected
      if (file) {
        const res = await uploadFileCloudinary(file);
        imageUrl = res.secure_url;
      }

      const updatedUser = await updateshop(data, imageUrl);

      if (updatedUser.status === "success") {
        toast({
          title: "Success",
          description: "Shop Details Updated Successfully",
        });
        await refetchUser();
      } else {
        toast({
          title: "Error",
          description: "Failed to update shop details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating",
        variant: "destructive",
      });
    }
  }

  return (
    user && (
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="shop_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Shop Name"
                      {...field}
                      className="w-80"
                    />
                  </FormControl>
                  <FormDescription>
                    Your shop name should be unique and easy to remember.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shop_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Shop Address"
                      {...field}
                      className="w-80"
                    />
                  </FormControl>
                  <FormDescription>
                    Your shop address should be unique and easy to remember.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gst_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="GST Number"
                      {...field}
                      className="w-80"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your GST number if applicable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_qr_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment QR Code</FormLabel>
                  <div>
                    <img
                      src={user?.image_url}
                      alt="QR Code"
                      className="w-20 h-20 rounded-md cursor-pointer  hover:scale-150 transition-transform duration-200"
                    />
                  </div>
                  {file && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Selected File"
                      className="w-20 h-20 rounded-md"
                    />
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      {...field}
                      className="w-80"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload the QR code image for online payment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Shop Details</Button>
          </form>
        </Form>
      </>
    )
  );
}
