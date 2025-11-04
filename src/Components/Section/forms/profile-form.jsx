"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../UI/shadcn-UI/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../UI/shadcn-UI/form";
import { Input } from "../../UI/shadcn-UI/input";
import { useUser } from "@/Context/UserContext";
import { updateUser } from "@/Handlers/UpdateUser";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";

const profileFormSchema = z.object({
  phone_number: z
    .string({
      required_error: "Please enter a valid phone number.",
    })
    .min(1, { message: "Phone number is required" }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  fname: z
    .string({
      required_error: "First Name is required",
    })
    .min(1, { message: "First Name is required" }),
  lname: z
    .string({
      required_error: "Last Name is required",
    })
    .min(1, { message: "Last Name is required" }),
});

export function ProfileForm() {
  const { user, refetchUser } = useUser();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
  });

  async function formSubmit(data) {
    const uid = user.uid._id;
    const updatedUser = await updateUser(data, uid);
    if (updatedUser.status === "success") {
      await refetchUser();
      toast({
        title: "Success",
        description: "User Updated Successfully",
      });
    }
  }

  return (
    <>
      {user && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full mt-4">
              <div className="flex flex-col justify-between items-start w-full">
                <FormField
                  control={form.control}
                  name="fname"
                  defaultValue={user.uid.fname}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed on your profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col justify-between items-start w-full">
                <FormField
                  control={form.control}
                  name="lname"
                  defaultValue={user.uid.lname}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed on your profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="phone_number"
              defaultValue={user.uid.phone_number.toString()}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    This is the Phone Number that will be displayed on your
                    profile and in search results. and{" "}
                    <b>{"it can't be changed."}</b>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              defaultValue={user.uid.email}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormDescription>
                    You can change your email address at any time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update profile</Button>
          </form>
        </Form>
      )}
    </>
  );
}
