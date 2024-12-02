import { Task, TaskTag } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const formSchema = z.object({
  taskId: z.number().nullable(),
  value: z.string().min(1, 'Add a value'),
  color: z.string(),
  createdBy: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface TaskTagFormProps {
  taskTag?: Partial<TaskTag>;
  task: Partial<Task>;
}

const TaskTagForm: React.FC<TaskTagFormProps> = ({ taskTag, task }) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: taskTag
      ? {
          taskId: taskTag.taskId,
          value: taskTag.value,
          color: taskTag.color,
          createdBy: taskTag.createdBy,
        }
      : {
          taskId: null,
          value: "",
          color: "",
          createdBy: "",
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    if (taskTag) {
      const { data, error } = await supabase
        .from("TaskTag")
        .update(values)
        .eq("id", taskTag.id);

      if (!error) toast.success("Task Tag editted successfully");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("TaskTag").insert([
        {
          ...values,
          taskId: task.id,
          createdBy: user?.id,
        },
      ]);

      if (!error) toast.success("Task Tag added successfully");
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value:</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Enter Value" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color:</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Enter Color" />
              </FormControl>
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

export default TaskTagForm;
