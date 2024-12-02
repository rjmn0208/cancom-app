"use client";

import { Patient, User, UserType, Vitals } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

const vitalReadingSchema = z.object({
  name: z.string(),
  unitOfMeasure: z.string(),
  description: z.string(),
  value: z.number().nullable(),
});

const formSchema = z.object({
  recordedBy: z.string({
    required_error: "Please select who recorded the vitals.",
  }),
  patientId: z.number({
    required_error: "Please select who is the patient.",
  }),
  vitalsData: z
    .array(
      vitalReadingSchema.refine((vital) => vital.value !== null, {
        message: "Vital reading cannot be empty.",
      })
    )
    .refine(
      (vitals) => vitals.every((vital) => vital.value >= 0),
      {
        message: "Vital readings must be non-negative numbers.",
      }
    ),
  timestamp: z.date({
    required_error: "Please select a date and time.",
  }),
  confirmAbnormalSubmit: z.boolean(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface VitalReadingFormProps {
  userType: UserType;
  onSubmitSuccess?: () => void;
}

const VitalReadingForm: React.FC<VitalReadingFormProps> = ({
  userType,
  onSubmitSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [defaultRecordedBy, setDefaultRecordedBy] = useState<any>();
  const [defaultPatientId, setDefaultPatientId] = useState<any>();
  const [warnings, setWarnings] = useState<string[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vitalsData: [
        { name: "Heart Rate", unitOfMeasure: "bpm", description: "Heart rate", value: 0 },
        { name: "Blood Pressure (Systolic)", unitOfMeasure: "mmHg", description: "Systolic blood pressure", value: 0 },
        { name: "Blood Pressure (Diastolic)", unitOfMeasure: "mmHg", description: "Diastolic blood pressure", value: 0 },
        { name: "SP02 (Blood Oxygen Saturation)", unitOfMeasure: "%", description: "Blood oxygen saturation", value: 0 },
        { name: "Body Temperature", unitOfMeasure: "°C", description: "Body temperature", value: 0 },
      ],
      timestamp: new Date(),
      confirmAbnormalSubmit: false,
    },
  });

  const validateVitals = (vitalsData: FormSchemaType["vitalsData"]) => {
    const abnormalWarnings: string[] = [];
    vitalsData.forEach((vital) => {
      if (vital.name === "Heart Rate" && (vital.value! < 60 || vital.value! > 100)) {
        abnormalWarnings.push("Heart Rate is abnormal.");
      }
      if (vital.name === "Blood Pressure (Systolic)" && (vital.value! < 90 || vital.value! > 140)) {
        abnormalWarnings.push("Systolic Blood Pressure is abnormal.");
      }
      if (vital.name === "Blood Pressure (Diastolic)" && (vital.value! < 60 || vital.value! > 90)) {
        abnormalWarnings.push("Diastolic Blood Pressure is abnormal.");
      }
      if (vital.name === "SP02 (Blood Oxygen Saturation)" && (vital.value! < 95 || vital.value! > 100)) {
        abnormalWarnings.push("Blood Oxygen Saturation is abnormal.");
      }
      if (vital.name === "Body Temperature" && (vital.value! < 36.1 || vital.value! > 37.2)) {
        abnormalWarnings.push("Body Temperature is abnormal.");
      }
    });
    setWarnings(abnormalWarnings);
    return abnormalWarnings;
  };

  const onSubmit = async (values: FormSchemaType) => {
    const abnormalWarnings = validateVitals(values.vitalsData);

    // If abnormal warnings are present and checkbox is unchecked, block submission
    if (abnormalWarnings.length > 0 && !values.confirmAbnormalSubmit) {
      form.setError("confirmAbnormalSubmit", {
        type: "manual",
        message: "You must confirm submission of abnormal vitals.",
      });

      // Ensure the warnings box displays
      setWarnings(abnormalWarnings);
      return; // Prevent submission
    }

    const supabase = createClient();
    const vitalReadings = values.vitalsData.map((vital) => {
      const vitalRecord = vitals.find((v) => v.name === vital.name);
      if (!vitalRecord) {
        throw new Error(`No matching vital found for name: ${vital.name}`);
      }

      return {
        recordedBy: values.recordedBy,
        patientId: values.patientId,
        value: vital.value,
        timestamp: values.timestamp.toISOString(),
        lastEditedBy: values.recordedBy,
        vitalsId: vitalRecord.id,
      };
    });

    const { error } = await supabase.from("VitalReading").insert(vitalReadings);

    if (error) {
      toast.error("Failed to record vital readings");
      console.error(error);
      return;
    }

    // On success
    toast.success("Vital readings recorded successfully");
    if (onSubmitSuccess) onSubmitSuccess(); // Trigger parent callback
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("User").select("*");
      if (!error) setUsers(data);
    };

    const fetchPatients = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("Patient").select(`*, User(*)`);
      if (!error) setPatients(data);
    };

    const fetchVitals = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("Vitals").select("*");
      if (!error) setVitals(data);
    };

    const fetchDefaultPatientId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("Patient")
        .select("id")
        .eq("userId", user?.id)
        .single();

      if (!error && data) {
        setDefaultPatientId(data.id);
        form.setValue("patientId", data.id);
      }
    };

    const fetchDefaultRecordedBy = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setDefaultRecordedBy(user.id);
        form.setValue("recordedBy", user.id);
      }
    };

    fetchUsers();
    fetchPatients();
    fetchVitals();
    fetchDefaultPatientId();
    fetchDefaultRecordedBy();
  }, []);

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-xl">Input Vital Reading Details</CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p className="font-bold">Please review the following:</p>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
              {!form.watch("confirmAbnormalSubmit") && (
                <li>You must confirm the submission of abnormal vitals.</li>
              )}
            </ul>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recorded By</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value || ""}
                      disabled={userType !== UserType.ADMIN}
                      value={defaultRecordedBy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Recorder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div>
                              {user.firstName} {user.middleName} {user.lastName}
                            </div>
                            <Badge className="my-2">{user.userType}</Badge>
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
                    <FormLabel>Patient</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? Number(value) : null)
                      }
                      defaultValue={field.value?.toString() || ""}
                      disabled={userType === UserType.PATIENT}
                      value={defaultPatientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.User.firstName} {patient.User.middleName} {patient.User.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Systolic BP</TableHead>
                  <TableHead>Diastolic BP</TableHead>
                  <TableHead>SPO2</TableHead>
                  <TableHead>Temperature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="timestamp"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date:</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value
                                  ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {form.watch("vitalsData").map((vital, index) => (
                    <TableCell key={vital.name}>
                      <FormField
                        control={form.control}
                        name={`vitalsData.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ? Number(field.value) : 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>

            <FormField
              control={form.control}
              name="confirmAbnormalSubmit"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id="confirmAbnormalSubmit"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                    <label htmlFor="confirmAbnormalSubmit" className="text-sm">
                      I confirm submitting abnormal vitals
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VitalReadingForm;
