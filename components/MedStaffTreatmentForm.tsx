"use client";

import { TreatmentTask, TaskType, Patient, TaskPriority } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  patientId: z.number().nullable(),
  description: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  treatmentType: z.string().min(1, "Treatment type is required"),
  date: z.date(),
  dosage: z.number().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;


interface MedStaffTreatmentFormProps {
  treatment?: any;
}

const validateDueDate = (dueDate: Date) => {
  return dueDate < new Date()
    ? "Due date must be after the current date"
    : null;
};
const MedStaffTreatmentForm: React.FC<MedStaffTreatmentFormProps> = ({
  treatment,
}) => {
  const [patients, setPatients] = useState<Patient[] | null>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: treatment
      ? {
          title: treatment.Task.title, // Use Task.title
          patientId: treatment.Task.TaskList?.Patient?.id || null,
          description: treatment.Task?.description,
          treatmentType: treatment.treatmentType,
          date: treatment.date ? new Date(treatment.date) : new Date(),
          dosage: Number(treatment.dosage),
          priority: treatment.Task?.priority, // Add this line
        }
      : {
          title: "",
          patientId: null,
          description: "",
          treatmentType: "",
          date: new Date(),
          dosage: undefined,
          priority: TaskPriority.LOW,
        },
  });

  const fetchPatients = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Patient").select("*, User(*)");

    if (!error) {
      setPatients(data);
    }
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    const {data: {user}} = await supabase.auth.getUser()

    if (!values.patientId) {
      toast.error("Select a patient");
      return;
    }
    
    if (values.date) {
      const validationError = validateDueDate(values?.date);
      if (validationError && !treatment) {
        toast.error(validationError);
        return;
      }
    }

    if(treatment) {
      
      //get tasklist by patient id
      const {data: TaskListData, error: TaskListError} = await supabase
      .from('TaskList')
      .select('id')
      .eq('patientId', values.patientId)
      .single()

      if(TaskListError) throw new Error(TaskListError.message)
      
      //get medicalinstitution of medstaff
      const { data: MedStaffData, error: MedStaffError } = await supabase
      .from("MedicalStaff")
      .select("medicalInstitutionId")
      .eq("userId", user?.id)
      .single();

      if (MedStaffError) throw new Error(MedStaffError.message);

      //set task values
      const {data: TaskData, error: TaskError} = await supabase
      .from('Task')
      .update({
        isDone: false,
        isArchived: false,
        taskListId: TaskListData.id,  
        
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.date,

        taskCreator: user?.id,
        type: TaskType.TREATMENT,
      })
      .eq('id', treatment.taskId)
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)

      //set trttask values
      const {data: TreatmentTaskData, error: TreatmentTaskError} = await supabase
      .from('TreatmentTask')
      .update({
        medicalInstitutionId: MedStaffData.medicalInstitutionId,
        taskId: TaskData?.id,

        treatmentType: values.treatmentType,
        date: values.date,
        dosage: values.dosage,
      })
      .eq('id', treatment.id)

      if(!TreatmentTaskError) toast.success('Treatment details saved successfully')


    } else {
      //get tasklist by patient id
      const {data: TaskListData, error: TaskListError} = await supabase
      .from('TaskList')
      .select('id')
      .eq('patientId', values.patientId)
      .single()

      if(TaskListError) throw new Error(TaskListError.message)
      
      //get medicalinstitution of medstaff
      const { data: MedStaffData, error: MedStaffError } = await supabase
      .from("MedicalStaff")
      .select("medicalInstitutionId")
      .eq("userId", user?.id)
      .single();

      if (MedStaffError) throw new Error(MedStaffError.message);

      //set task values
      const {data: TaskData, error: TaskError} = await supabase
      .from('Task')
      .insert({
        isDone: false,
        isArchived: false,
        taskListId: TaskListData.id,  
        
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.date,

        taskCreator: user?.id,
        type: TaskType.TREATMENT,
      })
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)

      //set trttask values
      const {data: TreatmentTaskData, error: TreatmentTaskError} = await supabase
      .from('TreatmentTask')
      .insert({
        medicalInstitutionId: MedStaffData.medicalInstitutionId,
        taskId: TaskData?.id,

        treatmentType: values.treatmentType,
        date: values.date,
        dosage: values.dosage,
      })

      if(!TreatmentTaskError) toast.success('Treatment details saved successfully')

    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title: </FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
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
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.User.firstName} {patient.User.middleName}{" "}
                      {patient.User.lastName}{" "}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter description of the treatment" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => (
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
          name="treatmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Type:</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter Treatment Type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Date:</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage (Units):</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter Dosage"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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

export default MedStaffTreatmentForm;
