"use client";

import { AppointmentTask } from "@/lib/types";
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
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  doctorsNotes: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface DoctorNotesFormProps {
  appointmentTask: Partial<AppointmentTask>;
}

const DoctorNotesForm: React.FC<DoctorNotesFormProps> = ({
  appointmentTask,
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorsNotes: appointmentTask?.doctorsNotes || "",
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    if (appointmentTask) {
      const { data, error } = await supabase
        .from("AppointmentTask")
        .update(values)
        .eq('id', appointmentTask.id)

      console.log(error)
      if (!error) toast.success(`Doctor's notes added successfully`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="doctorsNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes:</FormLabel>
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

export default DoctorNotesForm;
