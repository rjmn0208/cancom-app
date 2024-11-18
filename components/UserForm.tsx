"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { User } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  honorific: z.enum(["MR", "MS", "MRS", "DR", "PROF", "REV"]).nullable(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  userType: z
    .enum(["PATIENT", "CARETAKER", "DOCTOR", "ADMIN", "MEDICAL_STAFF"])
    .nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  phone: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface UserFormProps {
  userData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ userData }) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: userData
      ? {
          honorific: userData.honorific,
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          userType: userData.userType,
          gender: userData.gender,
          phone: userData.phone,
        }
      : {
          honorific: null,
          firstName: "",
          middleName: "",
          lastName: "",
          userType: null,
          gender: null,
          phone: "",
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (userData) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("User")
        .update(values)
        .eq("id", userData.id);

      if (!error) toast.success("User details edited successfully");
    } else {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("User").insert({
        id: user?.id,
        ...values,
      });

      if (!error) toast.success("User details saved successfully");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="honorific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Honorifics: </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["MR", "MS", "MRS", "DR", "PROF", "REV"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender: </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["MALE", "FEMALE", "OTHER"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type: </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
                disabled={!!userData}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    "PATIENT",
                    "CARETAKER",
                    "DOCTOR",
                    "ADMIN",
                    "MEDICAL_STAFF",
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;
