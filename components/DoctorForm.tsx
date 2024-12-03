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
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Doctor, Specialization } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  specializationId: z.number().nullable(),
  licenseNumber: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface DoctorFormProps {
  doctor?: Partial<Doctor>;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ doctor }) => {
  const [specializations, setSpecializations] = useState<Specialization[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: doctor
      ? {
          specializationId: doctor.specializationId,
          licenseNumber: doctor.licenseNumber,
        }
      : {
          specializationId: null,
          licenseNumber: "",
        },
  });

  const fetchSpecializations = async () => {
    const supabase = createClient()

    const {data, error } = await supabase
    .from('Specialization')
    .select('*')

    if(!error) setSpecializations(data)
  }

  const onSubmit = async (values: FormSchemaType) => {
    if (doctor) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Doctor")
        .update({
          specializationId: values.specializationId,
          licenseNumber: values.licenseNumber,
        })
        .eq("id", doctor.id);

        if(!error) toast.success('Doctor details updated successfully')
    } else {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("Doctor").insert({
        userId: user?.id,
        specializationId: values.specializationId,
        licenseNumber: values.licenseNumber,
      });

      if(!error) toast.success('Doctor details saved successfully')
    }
  };

  useEffect(() => {
    fetchSpecializations()
  }, [])
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
          control={form.control}
          name="specializationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancer Type:</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Cancer Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specializations?.map((spec: Specialization) => (
                    <SelectItem key={spec.id} value={spec.id.toString()}>
                      {spec.name}
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
