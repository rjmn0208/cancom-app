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
import { Doctor } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
  licenseNumber: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface DoctorFormProps {
  doctor?: Partial<Doctor>;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ doctor }) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: doctor
      ? {
          licenseNumber: doctor.licenseNumber,
        }
      : {
          licenseNumber: "",
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (doctor) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Doctor")
        .update({
          licenseNumber: values.licenseNumber,
        })
        .eq("id", doctor.id);
    } else {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("Doctor").insert({
        userId: user?.id,
        licenseNumber: values.licenseNumber,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
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

export default DoctorForm;
