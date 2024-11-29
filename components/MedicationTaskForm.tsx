'use client'


import {
  MedicationTask,
  MedicationTaskSchedule,
  Task,
  TaskType,
  Time,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatTime } from "@/utils/format-time";

const timeSchema = z.object({
  hour: z
    .number()
    .int()
    .min(1, { message: "Hour must be between 1 and 12" })
    .max(12, { message: "Hour must be between 1 and 12" }),
  minute: z
    .number()
    .int()
    .min(0, { message: "Minute must be between 0 and 59" })
    .max(59, { message: "Minute must be between 0 and 59" }),
  period: z.enum(["AM", "PM"], { required_error: "Period is required" }),
});

const formSchema = z.object({
  //base task fields
  title: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).nullable(),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number().nullable(),
  parentTaskId: z.number().nullable(),

  //medication task fields
  name: z.string(),
  medicineColor: z.string(),
  dosage: z.number().positive("Dosage must be a positive number").min(0.1, { message: "Dosage must be at least 0.1 mg" }).max(1000, { message: "Dosage cannot exceed 1000 mg" }),
  instructions: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  times: z.array(timeSchema),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface MedicationTaskFormProps {
  medicationTask?: Partial<MedicationTask>;
  taskListId?: number;
}

const validateDates = async (medTask: FormSchemaType) => {
  if (medTask.startDate && medTask.endDate)
    return medTask.startDate > medTask.endDate
      ? "Start date must be less than end date"
      : null;
};

const validateTimes = async (timeValues: Time[]) => {
  const seen = new Set();
  for (const time of timeValues) {
    const timeString = formatTime(time);
    if (seen.has(timeString)) {
      return "There are conflicting times. Please ensure all times are unique.";
    }
    seen.add(timeString);
  }
  return null; // No conflicts found
};


const MedicationTaskForm: React.FC<MedicationTaskFormProps> = ({
  medicationTask,
  taskListId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: medicationTask
      ? {
          //base task fields
          title: medicationTask.title,
          priority: medicationTask.priority,
          isDone: medicationTask.isDone,
          isArchived: medicationTask.isArchived,
          prerequisiteTaskId: medicationTask.prerequisiteTaskId,
          parentTaskId: medicationTask.parentTaskId,

          //medication task fields
          name: medicationTask.name,
          medicineColor: medicationTask.medicineColor,
          dosage: Number(medicationTask.dosage),
          instructions: medicationTask.instructions,
          startDate: medicationTask.startDate
            ? new Date(medicationTask.startDate)
            : null,
          endDate: medicationTask.endDate
            ? new Date(medicationTask.endDate)
            : null,

          times: medicationTask.times || [],
        }
      : {
          title: "",
          priority: null,
          isDone: false,
          isArchived: false,
          prerequisiteTaskId: null,
          parentTaskId: null,

          //medication task fields
          name: "",
          medicineColor: "",
          dosage: 0,
          instructions: "",
          startDate: null,
          endDate: null,
          times: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "times",
  });

  const fetchTasks = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("taskListId", taskListId ? taskListId : medicationTask?.taskListId)
      .eq("isDone", false);

    if (!error) setTasks(data);
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    const medTaskTimes =
    medicationTask?.MedicationTaskSchedule?.map(
      (sched: MedicationTaskSchedule) => sched.time
    ) || [];
    const timeValues = [...values.times, ...medTaskTimes];



    const validationDatesError = await validateDates(values);
    if (validationDatesError) {
      toast.error(validationDatesError);
      return;
    }

    const validationTimesError = await validateTimes(timeValues);
    if (validationTimesError) {
      toast.error(validationTimesError);
      return;
    }

    if (medicationTask) {
      const { data: TaskData, error: TaskError } = await supabase
        .from("Task")
        .update({
          title: values.title,
          priority: values.priority,
          isDone: values.isDone,
          isArchived: values.isArchived,
          prerequisiteTaskId: values.prerequisiteTaskId,
          parentTaskId: values.parentTaskId,
        })
        .eq("id", medicationTask.taskId)
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: MedicationData, error: MedicationError } = await supabase
        .from("MedicationTask")
        .update({
          name: values.name,
          medicineColor: values.medicineColor,
          dosage: values.dosage,
          instructions: values.instructions,
          startDate: values.startDate,
          endDate: values.endDate,
        })
        .eq("taskId", TaskData.id)
        .select()
        .single();

      if (MedicationError) throw new Error(MedicationError.message);

      const schedules = values.times.map((time) => {
        return {
          medicationTaskId: MedicationData?.id,
          time: formatTime(time),
          isTaken: false,
        };
      });

      const { error: scheduleError } = await supabase
        .from("MedicationTaskSchedule")
        .insert(schedules);

      if (scheduleError) throw new Error(scheduleError.message);

      toast.success("Medication task editted successfully");
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

            type: TaskType.MEDICATION,
          },
        ])
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: MedicationData, error: MedicationError } = await supabase
        .from("MedicationTask")
        .insert([
          {
            taskId: TaskData.id,
            name: values.name,
            medicineColor: values.medicineColor,
            dosage: values.dosage,
            instructions: values.instructions,
            startDate: values.startDate,
            endDate: values.endDate,
          },
        ])
        .select()
        .single();

      if (MedicationError) throw new Error(MedicationError.message);

      const schedules = values.times.map((time) => {
        return {
          medicationTaskId: MedicationData?.id,
          time: formatTime(time),
          isTaken: false,
        };
      });

      const { error: scheduleError } = await supabase
        .from("MedicationTaskSchedule")
        .insert(schedules);

      if (scheduleError) throw new Error(scheduleError.message);

      toast.success("Medication task created successfully");
    }
  };

  useEffect(() => {
    if (taskListId || medicationTask) {
      fetchTasks();
    }
  }, [taskListId, medicationTask]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  disabled={!medicationTask}
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicine Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicineColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicine Pill/Tablet Color:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Leave blank if medicine is not taken by tablet/pill"
                />
              </FormControl>
              <FormDescription>
                If the medicine has multiple colors, enter them separated by a
                slash (e.g., white/red).{" "}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage:</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ? Number(field.value) : 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Enter in milligrams (mg)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions:</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                You may add instruction on how the medicine should be taken
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date:</FormLabel>
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
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date:</FormLabel>
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

        <div>
          <h3 className="text-lg font-medium">Medication Times</h3>
          <div className="space-y-4">
            {medicationTask?.MedicationTaskSchedule &&
            medicationTask.MedicationTaskSchedule.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicationTask.MedicationTaskSchedule.map(
                  (sched: MedicationTaskSchedule) => (
                    <div
                      key={sched.id}
                      className="flex items-center justify-between p-2 rounded-md bg-secondary text-secondary-foreground"
                    >
                      <span className="font-medium">
                        {format(
                          new Date(`1970-01-01T${sched.time}`),
                          "hh:mm a"
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No medication times scheduled.
              </p>
            )}
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2 mt-2">
              <FormField
                control={form.control}
                name={`times.${index}.hour`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hour</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`times.${index}.minute`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minute</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`times.${index}.period`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                <X />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={() => append({ hour: 12, minute: 0, period: "PM" })}
            className="mt-2"
          >
            Add Time
          </Button>
        </div>

        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default MedicationTaskForm;
