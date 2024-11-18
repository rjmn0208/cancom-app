"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Patient, User, UserType, VitalReading, Vitals } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { readUserSession } from "@/utils/read-user-session";
import { jwtDecode } from "jwt-decode";
import { UUID } from "crypto";

const formSchema = z.object({
  recordedBy: z.string(),
  patientId: z.number().nullable(),
  value: z.number().finite().nullable(),
  vitalsId: z.number().nullable(),
  lastEditedBy: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface VitalReadingFormProps {
  vitalReading?: Partial<VitalReading>;
}

const validateVitalValues = (
  vitalReading: FormSchemaType,
  vitals: Vitals[],
) => {
  if (vitalReading.value == null || isNaN(vitalReading.value)) {
    return "Vital value cannot be empty or non-numeric.";
  }

  const vital = vitals.find((v) => v.id === vitalReading.vitalsId);
  if (!vital) return "Invalid vital type selected.";

  // Example validation ranges based on vital name
  switch (vital.name.toLowerCase()) {
    case "heart rate":
      if (vitalReading.value < 28 || vitalReading.value > 220) {
        return "Heart rate should be between 28 and 220.";
      }
      break;
    case "blood pressure (systolic)":
      if (vitalReading.value < 90 || vitalReading.value > 180) {
        return "Systolic blood pressure should be between 90 and 180.";
      }
      break;
    case "blood pressure (diastolic)":
      if (vitalReading.value < 60 || vitalReading.value > 120) {
        return "Diastolic blood pressure should be between 60 and 120.";
      }
      break;
    case "body temperature":
      if (vitalReading.value < 18 || vitalReading.value > 45) {
        return "Temperature should be between 18°C and 45°C.";
      }
      break;
    case "sp02 (blood oxygen saturation)":
      if (vitalReading.value < 97 || vitalReading.value > 99) {
        return "SP02 should be between 90% and 99%.";
      }
      break;
    // Add more cases for different vital names as needed
    default:
      return "Unknown vital type.";
  }

  return null;
};

const VitalReadingForm: React.FC<VitalReadingFormProps> = ({
  vitalReading,
}) => {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<UUID>();

  const fetchUserType = async () => {
    const {
      data: { session },
    } = await readUserSession();

    if (session) {
      const accessToken = session.access_token;
      const decodedToken: any = jwtDecode(accessToken);
      setIsAdmin(decodedToken.user_type === "ADMIN");
    }
  };

  const fetchVitals = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Vitals").select(`*`);

    if (!error) setVitals(data);
  };

  const fetchPatients = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Patient").select(`*, User(*)`);

    if (!error) setPatients(data);
  };

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("User").select(`*`);

    if (!error) {
      setUsers(data);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id as UUID);
  };

  useEffect(() => {
    fetchUsers();
    fetchVitals();
    fetchPatients();
    fetchUserType();
  }, []);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: vitalReading
      ? {
          recordedBy: vitalReading.recordedBy,
          patientId: vitalReading.patientId,
          value: vitalReading.value,
          vitalsId: vitalReading.vitalsId,
          lastEditedBy: vitalReading.lastEditedBy,
        }
      : {
          recordedBy: "",
          patientId: null,
          value: null,
          vitalsId: null,
          lastEditedBy: "",
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    const validationError = validateVitalValues(values, vitals);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (vitalReading) {
      const { data, error } = await supabase
        .from("VitalReading")
        .update({
          ...values,
          lastEditedBy: currentUserId,
        })
        .eq("id", vitalReading.id);

      if (!error) toast.success("Vital Reading edited succesfully");
    } else {
      const { data, error } = await supabase.from("VitalReading").insert({
        ...values,
        recordedBy: values.recordedBy || currentUserId,
        lastEditedBy: values.lastEditedBy || currentUserId,
      });
      console.log(values);
      console.log(error);

      if (!error) toast.success("VItal Reading created successfully");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="recordedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recorded By</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who recorded the vital reading" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div>User ID: {user.id}</div>
                      <div>
                        {user.firstName} {user.middleName} {user.lastName}
                      </div>
                      <Badge>{user.userType}</Badge>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient:</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))} // Convert string to number when setting
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient: Patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      <div>User ID: {patient.User.id}</div>
                      <div>
                        {patient.User.firstName} {patient.User.middleName}{" "}
                        {patient.User.lastName}
                      </div>
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
          name="vitalsId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vitals:</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))} // Convert string to number when setting
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vitals" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vitals?.map((vital: Vitals) => (
                    <SelectItem key={vital.id} value={vital.id.toString()}>
                      <div>{vital.name}</div>
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
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value:</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Vital value"
                  {...field}
                  value={Number(field.value) ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastEditedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Edited By</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who recorded the vital reading" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div>User ID: {user.id}</div>
                      <div>
                        {user.firstName} {user.middleName} {user.lastName}
                      </div>
                      <Badge>{user.userType}</Badge>
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

export default VitalReadingForm;
