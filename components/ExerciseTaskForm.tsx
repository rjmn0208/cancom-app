"use client";

import { ExerciseTask, Task, TaskType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const formSchema = z.object({
  //base task fields
  title: z.string().min(1, { message: "Title is empty" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).nullable(),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  dueDate: z.date().nullable(),
  prerequisiteTaskId: z.number().nullable(),
  parentTaskId: z.number().nullable(),

  //exercise task fields
  name: z.string(),
  sets: z.number(),
  reps: z.number(),
  durationPerSet: z.number().nullable(),
  durationPerRep: z.number().nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface ExerciseTaskFormProps {
  exerciseTask?: Partial<ExerciseTask>;
  taskListId?: number;
}

const ExerciseTaskForm: React.FC<ExerciseTaskFormProps> = ({
  exerciseTask,
  taskListId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: exerciseTask
      ? {
          //base task fields
          title: exerciseTask.title,
          priority: exerciseTask.priority,
          isDone: exerciseTask.isDone,
          isArchived: exerciseTask.isArchived,
          prerequisiteTaskId: exerciseTask.prerequisiteTaskId,
          parentTaskId: exerciseTask.parentTaskId,
          dueDate: exerciseTask.dueDate ? new Date(exerciseTask.dueDate) : null,

          //appointment task fields
          name: exerciseTask.name,
          sets: Number(exerciseTask.sets),
          reps: Number(exerciseTask.reps),
          durationPerSet: Number(exerciseTask.durationPerSet),
          durationPerRep: Number(exerciseTask.durationPerRep),
        }
      : {
          //base task fields
          title: "",
          priority: null,
          isDone: false,
          isArchived: false,
          prerequisiteTaskId: null,
          parentTaskId: null,
          dueDate: null,

          //appointment task fields
          name: "",
          sets: 0,
          reps: 0,
          durationPerSet: null,
          durationPerRep: null,
        },
  });

  const fetchTasks = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("taskListId", taskListId ? taskListId : exerciseTask?.taskListId)
      .eq("isDone", false);

    if (!error) setTasks(data);
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if (exerciseTask) {
      const { data: TaskData, error: TaskError } = await supabase
        .from("Task")
        .update({
          title: values.title,
          priority: values.priority,
          isDone: values.isDone,
          isArchived: values.isArchived,
          dueDate: values.dueDate,
          prerequisiteTaskId: values.prerequisiteTaskId,
          parentTaskId: values.parentTaskId,
        })
        .eq("id", exerciseTask.taskId)
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: ExerciseTaskData, error: ExerciseTaskError } =
        await supabase
          .from("ExerciseTask")
          .update({
            name: values.name,
            sets: values.sets,
            reps: values.reps,
            durationPerSet: values.durationPerSet,
            durationPerRep: values.durationPerRep,
          })
          .eq("taskId", TaskData.id);

      if (!ExerciseTaskError)
        toast.success("Exercise details editted successfully");
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
            dueDate: values.dueDate,
            prerequisiteTaskId: values.prerequisiteTaskId,
            parentTaskId: values.parentTaskId,
            taskCreator: user?.id,

            type: TaskType.EXERCISE,
          },
        ])
        .select()
        .single();

      if (TaskError) throw new Error(TaskError.message);

      const { data: ExerciseTaskData, error: ExerciseTaskError } =
        await supabase.from("ExerciseTask").insert({
          taskId: TaskData.id,
          name: values.name,
          sets: values.sets,
          reps: values.reps,
          durationPerSet: values.durationPerSet,
          durationPerRep: values.durationPerRep,
        });

      if (!ExerciseTaskError)
        toast.success("Exercise details saved successfully");
    }
  };

  useEffect(() => {
    if (taskListId || exerciseTask) {
      fetchTasks();
    }
  }, [taskListId, exerciseTask]);

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
          name="isDone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!exerciseTask}
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
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date:</FormLabel>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sets:</FormLabel>
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

        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps:</FormLabel>
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

        <FormField
          control={form.control}
          name="durationPerSet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration Per Set:</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ? Number(field.value) : 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Enter in minutes (m)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationPerRep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration Per Rep:</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ? Number(field.value) : 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Enter in minutes (m)</FormDescription>
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

export default ExerciseTaskForm;
