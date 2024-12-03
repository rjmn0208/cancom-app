"use client";

import { Vitals } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const formSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  unitOfMeasure: z.string().min(1, "Unit Of Measure must not be empty"),
  description: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface VitalsFormProps {
  vitals?: Partial<Vitals>;
}

const VitalsForm: React.FC<VitalsFormProps> = ({ vitals }) => {
  const [isSubmitted, setSubmitted] = useState<boolean>(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: vitals
      ? {
          name: vitals.name,
          unitOfMeasure: vitals.unitOfMeasure,
          description: vitals.description,
        }
      : {
          name: "",
          unitOfMeasure: "",
          description: "",
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if (vitals) {
      const { data, error } = await supabase
        .from("Vitals")
        .update(values)
        .eq("id", vitals.id);

      if (!error) toast.success("Vital edited successfully.");
    } else {
      const { data, error } = await supabase
        .from("Vitals")
        .insert({ ...values });

      if (!error) toast.success("Vital created successfully");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitOfMeasure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Of Measure:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description:</FormLabel>
              <FormControl>
                <Textarea {...field} />
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

export default VitalsForm;
