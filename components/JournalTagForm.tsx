import { JournalEntry, JournalTag, Task, TaskTag } from "@/lib/types";
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
  journalId: z.number().nullable(),
  value: z.string().min(1, "Value must not be empty"),
  color: z.string(),
  createdAt: z.date(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface JournalTagFormProps {
  journalTag?: Partial<JournalTag>;
  journal: Partial<JournalEntry>;
}

const JournalTagForm: React.FC<JournalTagFormProps> = ({
  journalTag,
  journal,
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: journalTag
      ? {
          journalId: journalTag.journalId,
          value: journalTag.value,
          color: journalTag.color,
          createdAt: journalTag.createdAt
            ? new Date(journalTag.createdAt)
            : new Date(),
        }
      : {
          journalId: null,
          value: "",
          color: "",
          createdAt: new Date(),
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    if (journalTag) {
      const { data, error } = await supabase
        .from("JournalTag")
        .update(values)
        .eq("id", journalTag.id);

      if (!error) toast.success("Task Tag editted successfully");
    } else {
      const { data, error } = await supabase.from("JournalTag").insert([
        {
          ...values,
          journalId: journal.id,
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

export default JournalTagForm;
