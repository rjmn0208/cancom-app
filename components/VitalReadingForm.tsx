"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


const formSchema = z.object({
  recordedBy: z.string(),
  patientId: z.number().nullable(),
  vitalsData: z.array(
    z.object({
      date: z.string().nullable(),
      heartRate: z.number().nullable(),
      systolicBloodPressure: z.number().nullable(),
      diastolicBloodPressure: z.number().nullable(),
      spO2: z.number().nullable(),
      temperature: z.number().nullable(),
    })
  ),
});

type FormSchemaType = z.infer<typeof formSchema>;

const VitalReadingForm: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: users } = await supabase.from("User").select("*");
      const { data: patients } = await supabase.from("Patient").select("*");
      setUsers(users || []);
      setPatients(patients || []);
    };
    fetchData();
  }, []);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordedBy: "",
      patientId: null,
      vitalsData: [{ date: "", heartRate: null, systolicBloodPressure: null, diastolicBloodPressure: null, spO2: null, temperature: null }],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "vitalsData",
  });

  const onSubmit = async (values: FormSchemaType) => {
    console.log(values);
    toast.success("Vital Reading recorded successfully!");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recorded By */}
            <FormField
              control={form.control}
              name="recordedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Recorded By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recorder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Patient */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Patient</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Add More Rows Button */}
          <Button
            type="button"
            onClick={() =>
              append({ date: "", heartRate: null, systolicBloodPressure: null, diastolicBloodPressure: null, spO2: null, temperature: null })
            }
            className="mb-6 mt-6"
          >
            Add More Rows
          </Button>

          {/* Vital Readings Table */}
          <div className="w-full overflow-x-auto rounded-lg border">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[20%] px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium text-gray-700">Heart Rate (bpm)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium text-gray-700">Systolic BP (mmHg)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium text-gray-700">Diastolic BP (mmHg)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium text-gray-700">SPO2 (%)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium text-gray-700">Temperature (°C)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.date`)} 
                        type="datetime-local" 
                        className="w-full" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.heartRate`)} 
                        type="number"
                        className="w-full" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.systolicBloodPressure`)} 
                        type="number"
                        className="w-full" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.diastolicBloodPressure`)} 
                        type="number"
                        className="w-full" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.spO2`)} 
                        type="number"
                        className="w-full" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        {...form.register(`vitalsData.${index}.temperature`)} 
                        type="number"
                        className="w-full" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-8">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default VitalReadingForm;