"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Calendar } from "@/Components/UI/shadcn-UI/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/UI/shadcn-UI/popover";
import { useContext } from "react";
import CustomerEntryContext from "@/Context/CustomerEntryContext";
import { config } from "@/Data/config";
import { useQuery } from "node_modules/@tanstack/react-query/build/modern/useQuery.cjs";

const FormSchema = z.object({
  delivery_date: z.date({
    required_error: "A date of birth is required.",
  }),
});

export function DatePickerForm({ setSelectedDate }) {
  const getdeliverydateData = (date) => {
    setSelectedDate(date);
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Form {...form}>
      <form
        className="space-y-8 max-w-md
          w-full
          mx-auto
          sm:max-w-xl
        "
      >
        <FormField
          control={form.control}
          name="delivery_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              {/* <FormLabel>Date of birth</FormLabel> */}
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      form.setValue("delivery_date", date);
                      getdeliverydateData(date);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                select a date to view the customer entry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type="submit">Submit</Button> */}
      </form>
    </Form>
  );
}
