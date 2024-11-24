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
import { Patient, User, UserType, VitalReading } from "@/lib/types";
import { jwtDecode } from "jwt-decode";
import { readUserSession } from "@/utils/read-user-session";
import { error } from "console";


const formSchema = z.object({
  recordedBy: z.string(),
  patientId: z.number().nullable(),
  vitalsData: z.array(
    z.object({
      date: z.string().nonempty("Date is required"), // Ensure a value is provided
      heartRate: z.coerce.number()
        .min(40, "Heart rate must be at least 40 bpm")
        .max(200, "Heart rate cannot exceed 200 bpm")
        .nullable(),
      systolicBloodPressure: z.coerce.number()
        .min(90, "Systolic BP must be at least 90 mmHg")
        .max(200, "Systolic BP cannot exceed 200 mmHg")
        .nullable(),
      diastolicBloodPressure: z.coerce.number()
        .min(60, "Diastolic BP must be at least 60 mmHg")
        .max(120, "Diastolic BP cannot exceed 120 mmHg")
        .nullable(),
      spO2: z.coerce.number()
        .min(0, "SPO2 must be at least 0%")
        .max(100, "SPO2 cannot exceed 100%")
        .nullable(),
      temperature: z.coerce.number()
        .min(30.0, "Temperature must be at least 30.0°C")
        .max(45.0, "Temperature cannot exceed 45.0°C")
        .nullable(),
    })
  ),
});



type FormSchemaType = z.infer<typeof formSchema>;


interface VitalReadingFormProps {
  vitalReading?: Partial<VitalReading>
}

const VitalReadingForm: React.FC<VitalReadingFormProps> = ({vitalReading}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [userType, setUserType] = useState<UserType>();


  const fetchUserType = async () => {
    const {
      data: { session },
    } = await readUserSession();
    if (session) {
      const accessToken = session.access_token;
      const decodedToken: any = jwtDecode(accessToken);
      setUserType(decodedToken.user_type as UserType);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: users, error: UserError } = await supabase.from("User").select("*");
      if(!UserError) setUsers(users);

      const { data: patients, error: PatientError} = await supabase.from("Patient").select("*, User(*)");
      if(!PatientError) setPatients(patients);
    };
    fetchData();
    fetchUserType();
    
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
    console.log('FormValues', values);
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={userType !== UserType.ADMIN}>
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
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()} disabled={userType === UserType.PATIENT}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.User.firstName} {patient.User.middleName} {patient.User?.lastName}
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
          <div className="w-full overflow-y-auto rounded-lg border max-h-[400px]">
            <table className="w-full divide-y divide-gray-200">
              <thead >
                <tr>
                  <th className="w-[20%] px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium">Heart Rate (bpm)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium">Systolic BP (mmHg)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium">Diastolic BP (mmHg)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium">SPO2 (%)</th>
                  <th className="w-[16%] px-4 py-3 text-left text-sm font-medium">Temperature (°C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                        step="0.1"
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

