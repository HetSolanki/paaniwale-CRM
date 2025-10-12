/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/UI/shadcn-UI/alert-dialog";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "../shadcn-UI/use-toast";
import { useState } from "react";
import { Button } from "../shadcn-UI/button";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "@/Data/config";

export default function DeleteCustomer({ cid }) {
  const [click, setClick] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteRecord = async (cid) => {
    try {
      setClick(true);
      const deletedCustomer = await fetch(
        `${config.baseUrl}/api/customers/customer/${cid}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!deletedCustomer.ok) {
        throw new Error(`HTTP error! status: ${deletedCustomer.status}`);
      }

      const res = await deletedCustomer.json();

      if (res.status === "success") {
        toast({
          title: "Success",
          description: "Customer deleted successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      } else {
        throw new Error(res.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to delete customer. Please try again.",
      });
    } finally {
      setClick(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <div>
            <Trash2 />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90%] rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this customer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col">
            {!click ? (
              <AlertDialogAction onClick={() => deleteRecord(cid)}>
                Delete
              </AlertDialogAction>
            ) : (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            )}

            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* <ToastContainer /> */}
    </>
  );
}
