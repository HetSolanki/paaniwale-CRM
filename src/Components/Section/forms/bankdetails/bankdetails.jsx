import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { useUser } from "@/Context/UserContext";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { updateUser } from "@/Handlers/UpdateUser";

const bankdetailsFormSchema = z.object({
  branch_ifsc_code: z.string(),
  account_number: z.string(),
  benificiary_name: z.string(),
});

export function BankdetailsForm() {
  const { user, refetchUser, loading } = useUser();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(bankdetailsFormSchema),
    defaultValues: {
      branch_ifsc_code: "",
      account_number: "",
      benificiary_name: "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user?.uid) {
      form.reset({
        branch_ifsc_code: user.uid.branch_ifsc_code || "",
        account_number: user.uid.account_number || "",
        benificiary_name: user.uid.benificiary_name || "",
      });
    }
  }, [user, form]);

  async function formSubmit(data) {
    const uid = user.uid._id;
    const updatedUser = await updateUser(data, uid);
    if (updatedUser.status === "success") {
      await refetchUser();
      toast({
        title: "Success",
        description: "Bank Details Updated Successfully",
      });
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">No user data found</div>;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(formSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="branch_ifsc_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch IFSC Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Branch IFSC Code"
                    {...field}
                    className="w-80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Account Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="benificiary_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiary Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Beneficiary Name"
                    {...field}
                    className="w-80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Request For Verify Bank Details</Button>
        </form>
      </Form>
    </>
  );
}
