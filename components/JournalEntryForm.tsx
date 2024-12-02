import { JournalEntry } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


const formSchema = z.object({
  title: z.string().min(1, 'Title is missing'),
  content: z.string().min(1, 'Write the contents of your journal'),
  mood: z.string(),
  dateEntered: z.date(),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface JournalEntryFormProps {
  journalEntry?: Partial<JournalEntry>
}


const JournalEntryForm: React.FC<JournalEntryFormProps> = ({journalEntry}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: journalEntry
      ? {
          title: journalEntry.title, // Ensure it falls back to an empty string
          content: journalEntry.content,
          mood: journalEntry.mood,
          dateEntered: journalEntry.dateEntered ? new Date(journalEntry.dateEntered) : new Date(),
        }
      : {
          title: "",
          content: "",
          mood: "",
          dateEntered: new Date(),
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()

    const getPatientId = async () => {
      const {data: {user}} = await supabase.auth.getUser()

      const {data, error} = await supabase.from('Patient').select('id').eq('userId', user?.id).single()
      if(!error && data) return data.id
    }

    let patientId = await getPatientId()

    if (journalEntry) {
      const { error } = await supabase
        .from("JournalEntry")
        .update({
          ...values
        })
        .eq("id", journalEntry.id);

      if(!error) toast.success('Journal entry updated succesfully')
    } else {
      const { error } = await supabase.from("JournalEntry").insert([
        {
          ...values, 
          patientId: patientId
        }
      ]);
      if(!error) toast.success('Journal entry saved succesfully')
    }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  )
}

export default JournalEntryForm