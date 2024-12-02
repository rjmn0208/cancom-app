import { Task, TaskComment } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
import { Textarea } from "./ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";

const formSchema = z.object({
  taskId: z.number().optional(),
  authorId: z.string().optional(),
  content: z.string(),
  timestamp: z.date().default(new Date()),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface TaskCommentFormProp {
  taskComment?: Partial<TaskComment>;
  task: Partial<Task>;
}

const TaskCommentForm: React.FC<TaskCommentFormProp> = ({
  taskComment,
  task,
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: taskComment
      ? {
          taskId: taskComment.taskId,
          authorId: taskComment.authorId,
          content: taskComment.content,
          timestamp: taskComment.timestamp
            ? new Date(taskComment.timestamp)
            : new Date(),
        }
      : {
          taskId: undefined,
          authorId: "",
          content: undefined,
          timestamp: new Date(),
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    console.log('onsubmit ',values)
    if (taskComment) {
      const { data, error } = await supabase
        .from("Comment")
        .update(values)
        .eq("id", taskComment.id);

      console.log();
      if (!error) toast.success("Comment editted successfully");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("Comment").insert([
        {
          ...values,
          taskId: task.id,
          authorId: user?.id,
        },
      ]);

      if (!error) toast.success("Comment added successfully");
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment:</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter your comments" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-4">
          Add Comment
        </Button>
      </form>
    </Form>
  );
};

export default TaskCommentForm;
