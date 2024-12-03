"use client";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CancerType, Patient } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const formSchema = z.object({
  cancerTypeId: z.number().nullable(),
  cancerStage: z.enum([
    "STAGE_0",
    "STAGE_I",
    "STAGE_II",
    "STAGE_III",
    "STAGE_IV",
  ]).nullable(),
  diagnosisDate: z.date(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface PatientFormProps {
  patient?: Partial<Patient>;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient }) => {
  const [cancerTypes, setCancerTypes] = useState<CancerType[]>([]);

  const fetchCancerTypes = async () => {
    const supabase = createClient();

    const { data, error } = await supabase.from("CancerType").select("*");

    if (!error) setCancerTypes(data);
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (patient)
      ? {
          cancerTypeId: patient.cancerTypeId,
          cancerStage: patient.cancerStage,
          diagnosisDate: (patient.diagnosisDate) ? new Date(patient.diagnosisDate) : new Date(),
        }
      : {
          cancerTypeId: null,
          cancerStage: null,
          diagnosisDate: new Date(),
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (patient) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Patient")
        .update({
          cancerTypeId: values.cancerTypeId,
          cancerStage: values.cancerStage,
          diagnosisDate: values.diagnosisDate?.toISOString(),
        })
        .eq("id", patient.id);

      if (!error) toast.success("Patient information editted succesfully");
    } else {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("Patient").insert({
        userId: user?.id,
        cancerType: values.cancerTypeId,
        cancerStage: values.cancerStage,
        diagnosisDate: values.diagnosisDate.toISOString(),
      });

      if (!error) toast.success("Patient information saved succesfully");
    }
  };

  useEffect(() => {
    fetchCancerTypes();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="cancerTypeId"
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
                  {cancerTypes?.map((type: CancerType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
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
          name="cancerStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancer Stage:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    "STAGE_0",
                    "STAGE_I",
                    "STAGE_II",
                    "STAGE_III",
                    "STAGE_IV",
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
        <FormField
          control={form.control}
          name="diagnosisDate"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-3">
              <FormLabel>Diagnosis Date:</FormLabel>
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

export default PatientForm;
