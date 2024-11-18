"use client";

import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { ListMembership, User } from "@/lib/types";
import { toast } from "sonner";

const formSchema = z.object({
  userId: z.string(),
  taskListId: z.number().nullable(),
  permission: z.enum(["MANAGER", "MEMBER"]).nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface ListMembershipFormProps {
  listMember?: Partial<ListMembership>;
  taskListId?: number;
}

const ListMemberForm: React.FC<ListMembershipFormProps> = ({
  listMember,
  taskListId,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: listMember
      ? {
          userId: listMember.userId,
          taskListId: listMember.taskListId,
          permission: listMember.permission,
          startDate: listMember.startDate
            ? new Date(listMember.startDate)
            : null,
          endDate: listMember.endDate ? new Date(listMember.endDate) : null,
        }
      : {
          userId: "",
          taskListId: taskListId,
          permission: null,
          startDate: null,
          endDate: null,
        },
  });

  const fetchUsers = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("User")
      .select("*")
      .neq("id", user?.id);

    if (!error) {
      setUsers(data);
    }
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if (listMember) {
      const { data, error } = await supabase
        .from("ListMembership")
        .update(values)
        .eq("id", listMember.id);

      if (!error) toast.success("List membership editted to successfully");
    } else {
      const { data, error } = await supabase.from("ListMembership").insert({
        ...values,
      });

      console.log(error);
      if (!error) toast.success("User added to taskList");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      <p>
                        <b>User ID:</b> {user.id}
                      </p>
                      <p>
                        <b>User Name:</b> {user.firstName} {user.middleName}{" "}
                        {user.lastName}
                      </p>
                      <b>{user.userType}</b>
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
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Permission" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["MANAGER", "MEMBER"].map((value) => (
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
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date:</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value
                      ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    field.onChange(new Date(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date:</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value
                      ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    field.onChange(new Date(e.target.value));
                  }}
                />
              </FormControl>
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

export default ListMemberForm;
