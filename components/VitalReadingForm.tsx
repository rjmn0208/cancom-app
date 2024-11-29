"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Patient, User, UserType } from "@/lib/types";
import { jwtDecode } from "jwt-decode";
import { readUserSession } from "@/utils/read-user-session";

const formSchema = z.object({
  recordedBy: z.string(),
  patientId: z
    .number({
      required_error: "Patient is required",
    })
    .nullable()
    .refine((value) => value !== null, {
      message: "Patient is required",
    }),
  vitalsData: z.array(
    z.object({
      date: z.string().nonempty("Date is required"),
      heartRate: z.string().nonempty("Heart rate is required").transform((val) => parseFloat(val)),
      systolicBloodPressure: z.string().nonempty("Systolic BP is required").transform((val) => parseFloat(val)),
      diastolicBloodPressure: z.string().nonempty("Diastolic BP is required").transform((val) => parseFloat(val)),
      spO2: z.string().nonempty("SPO2 is required").transform((val) => parseFloat(val)),
      temperature: z.string().nonempty("Temperature is required").transform((val) => parseFloat(val)),
      abnormalityConfirmed: z.boolean().optional(),
    })
  ),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface VitalReadingFormProps {
  onClose: () => void; // Prop to handle closing the modal
}

const VitalReadingForm: React.FC<VitalReadingFormProps> = ({ onClose }) => {
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
      if (!UserError && users) setUsers(users);

      const { data: patients, error: PatientError } = await supabase.from("Patient").select("*, User(*)");
      if (!PatientError && patients) setPatients(patients);
    };
    fetchData();
    fetchUserType();
  }, []);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordedBy: "",
      patientId: null,
      vitalsData: [
        {
          date: "",
          heartRate: "",
          systolicBloodPressure: "",
          diastolicBloodPressure: "",
          spO2: "",
          temperature: "",
          abnormalityConfirmed: false,
        },
      ],
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const abnormalReadings = values.vitalsData.filter((reading) => {
      const isAbnormal =
        reading.heartRate < 40 ||
        reading.heartRate > 200 ||
        reading.systolicBloodPressure < 90 ||
        reading.systolicBloodPressure > 200 ||
        reading.diastolicBloodPressure < 60 ||
        reading.diastolicBloodPressure > 120 ||
        reading.spO2 < 90 ||
        reading.spO2 > 100 ||
        reading.temperature < 30 ||
        reading.temperature > 45;

      return isAbnormal && !reading.abnormalityConfirmed;
    });

    if (abnormalReadings.length > 0) {
      toast.error("Abnormal readings detected. Please confirm abnormalities.");
      return;
    }

    console.log("FormValues", values);
    toast.success("Vital Reading recorded successfully!");
    onClose(); // Call the parent-provided close function
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <FormField
              control={form.control}
              name="recordedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Recorded By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={userType !== UserType.ADMIN}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recorder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user: User) => (
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

            <FormField
              control={form.control}
              name="patientId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Patient</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()} disabled={userType === UserType.PATIENT}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.User.firstName} {patient.User.middleName || ""} {patient.User?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="mb-8">
            <div className="w-full overflow-y-auto rounded-lg border border-gray-300 max-h-[400px]">
              <table className="w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Heart Rate</th>
                    <th className="px-4 py-3">Systolic BP</th>
                    <th className="px-4 py-3">Diastolic BP</th>
                    <th className="px-4 py-3">SPO2</th>
                    <th className="px-4 py-3">Temperature</th>
                    <th className="px-4 py-3">Confirm Abnormality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.date`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="datetime-local" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.heartRate`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="number" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.systolicBloodPressure`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="number" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.diastolicBloodPressure`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="number" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.spO2`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="number" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.temperature`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <Input {...field} type="number" className="w-full border-gray-300 rounded" />
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`vitalsData.0.abnormalityConfirmed`}
                        render={({ field }) => (
                          <FormItem>
                            <Input type="checkbox" {...field} className="rounded border-gray-300" />
                          </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default VitalReadingForm;
