"use client";

import { MedicalInstitution, Task, TaskPriority, TaskType, TreatmentTask } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

const formSchema = z.object({
  //base task fields
  title: z.string().min(1, { message: "Title is empty" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number().nullable(),
  parentTaskId: z.number().nullable(),

  //treatment task fields
  medicalInstitutionId: z.number(),
  treatmentType: z.string(),
  date: z.date(),
  dosage: z.number().nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface TreatmenTaskFormProps {
  treatmentTask?: Partial<TreatmentTask>;
  taskListId?: number;
}

const validateDueDate = (dueDate: Date) => {
  return dueDate < new Date()
    ? "Due date must be after the current date"
    : null;
};

const TreatmentTaskForm: React.FC<TreatmenTaskFormProps> = ({
  treatmentTask,
  taskListId,
}) => {
  const [medicalInstitutions, setMedicalInstitutions] = useState<
    MedicalInstitution[]
  >([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: treatmentTask
      ? {
          //base task fields
          title: treatmentTask.title,
          priority: treatmentTask.priority,
          isDone: treatmentTask.isDone,
          isArchived: treatmentTask.isArchived,
          prerequisiteTaskId: treatmentTask.prerequisiteTaskId,
          parentTaskId: treatmentTask.parentTaskId,

          //treatment task fields
          medicalInstitutionId: treatmentTask.medicalInstitutionId,
          treatmentType: treatmentTask.treatmentType,
          date: treatmentTask.date ? new Date(treatmentTask.date) : new Date(),
          dosage: Number(treatmentTask.dosage),
        }
      : {
          //base task fields
          title: "",
          priority: TaskPriority.LOW,
          isDone: false,
          isArchived: false,
          prerequisiteTaskId: null,
          parentTaskId: null,

          //treatment task fields
          treatmentType: "",
          date: new Date(),
          dosage: null,
        },
  });

  const fetchMedicalInstitutions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("MedicalInstitution")
      .select("*, Address(*)");

    if (!error && data) setMedicalInstitutions(data);
  };

  const fetchTasks = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("taskListId", taskListId ? taskListId : treatmentTask?.taskListId)
      .eq("isDone", false);

    if (!error) setTasks(data);
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if (values.date) {
      const validationError = validateDueDate(values?.date);
      if (validationError && !treatmentTask) {
        toast.error(validationError);
        return;
      }
    }

    if (treatmentTask) {
      const { data: TaskData, error: TaskError } = await supabase
        .from("Task")
        .update({
          title: values.title,
          priority: values.priority,
          isDone: values.isDone,
          isArchived: values.isArchived,
          prerequisiteTaskId: values.prerequisiteTaskId,
          parentTaskId: values.parentTaskId,

          dueDate: values.date,
        })
        .eq("id", treatmentTask.taskId)
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: TreatmentTaskData, error: TreatmentError } = await supabase
        .from("TreatmentTask")
        .update({
          medicalInstitutionId: values.medicalInstitutionId,
          treatmentType: values.treatmentType,
          date: values.date,
          dosage: values.dosage,
        })
        .eq("taskId", TaskData.id)
        .select();

      if (!TreatmentError) toast.success("Treatment editted successfully");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: TaskData, error: TaskError } = await supabase
        .from("Task")
        .insert([
          {
            taskListId: taskListId,
            title: values.title,
            priority: values.priority,
            isDone: values.isDone,
            isArchived: values.isArchived,
            prerequisiteTaskId: values.prerequisiteTaskId,
            parentTaskId: values.parentTaskId,
            taskCreator: user?.id,

            dueDate: values.date,
            type: TaskType.TREATMENT,
          },
        ])
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: TreatmentTaskData, error: TreatmentError } = await supabase
        .from("TreatmentTask")
        .insert([
          {
            taskId: TaskData.id,
            medicalInstitutionId: values.medicalInstitutionId,
            treatmentType: values.treatmentType,
            date: values.date,
            dosage: values.dosage,
          },
        ])
        .select();

      if (!TreatmentError)
        toast.success("Treatment details saved successfully");
    }
  };

  useEffect(() => {
    if (taskListId || treatmentTask) {
      fetchMedicalInstitutions();
      fetchTasks();
    }
  }, [taskListId, treatmentTask]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title:</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Enter Title" />
              </FormControl>
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
          name="isDone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!treatmentTask}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Done</FormLabel>
                <FormDescription>Mark this task as completed</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isArchived"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Archived</FormLabel>
                <FormDescription>Mark this task as archived</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalInstitutionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Institution:</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Medical Institution" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {medicalInstitutions?.map(
                    (institution: MedicalInstitution) => (
                      <SelectItem
                        key={institution.id}
                        value={institution.id.toString()}
                      >
                        <p className="font-bold">{institution.name}</p>
                        <Separator className="color-white" />
                        <p>{institution.Address.addressLineOne}</p>
                        <p>{institution.Address.addressLineTwo}</p>
                        <p>{institution.Address.city}</p>
                        <p>{institution.Address.province}</p>
                        <p>{institution.Address.country}</p>
                      </SelectItem>
                    )
                  )}
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
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date:</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
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
              <FormLabel {...field}>Dosage:</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ? Number(field.value) : 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Units</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prerequisiteTaskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prerequisite Task</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Prerequisite Task" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title} ({task.type})
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
          name="parentTaskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Task</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Parent Task" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title} ({task.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a task to set this one as its subtask. Leave blank if
                this task has no parent.
              </FormDescription>
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

export default TreatmentTaskForm;
