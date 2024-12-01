import React, { useState } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Address } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const formSchema = z.object({
  addressLineOne: z.string().min(1, "Address Line One is required"),
  addressLineTwo: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  type: z.enum(["PERMANENT", "CURRENT"], "Select a valid address type").nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface AddressFormProps {
  address?: Address;
  onFinish?: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onFinish }) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: address
      ? {
          addressLineOne: address.addressLineOne,
          addressLineTwo: address.addressLineTwo,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
          type: address.type,
        }
      : {
          addressLineOne: "",
          addressLineTwo: "",
          city: "",
          province: "",
          postalCode: "",
          country: "",
          type: null,
        },
  });

  const [loading, setLoading] = useState(false); // Track loading state

  const onSubmit = async (values: FormSchemaType) => {
    setLoading(true); // Start loading
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      if (!user) throw new Error("User not authenticated");

      if (address) {
        const { error } = await supabase
          .from("Address")
          .update(values)
          .eq("id", address.id);
        if (error) throw error;

        toast.success("Address edited successfully");
      } else {
        const { error } = await supabase
          .from("Address")
          .insert([{ ...values, userId: user.id }]);
        if (error) throw error;

        toast.success("Address saved successfully");
      }

      if (onFinish) onFinish(); // Navigate only on success
    } catch (error: any) {
      const message =
        error.message || "Something went wrong. Please try again later.";
      toast.error(`Error: ${message}`);
      console.error("Error saving address:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="addressLineOne"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line One:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressLineTwo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line Two:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Type:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Address Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PERMANENT">PERMANENT</SelectItem>
                  <SelectItem value="CURRENT">CURRENT</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full mt-4 flex justify-center items-center gap-2"
          disabled={loading} // Disable button when loading
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default AddressForm;
