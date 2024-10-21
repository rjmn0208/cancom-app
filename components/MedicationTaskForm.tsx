import { MedicationTask } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "react-day-picker";


const formSchema = z.object({
  taskId: z.number().nullable(),
  medicineColor: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  instructions: z.string()
})

type FormSchemaType = z.infer<typeof formSchema>;

interface MedicationTaskFormProps {
  medicationTask?: Partial<MedicationTask>,
}

const MedicationTaskForm: React.FC<MedicationTaskFormProps> = ({medicationTask}) => {
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: medicationTask
    ? {
      taskId: medicationTask.taskId,
      medicineColor: medicationTask.medicineColor,
      startDate: medicationTask.startDate,
      endDate: medicationTask.endDate,
      instructions: medicationTask.instructions
    } : {
      taskId: null,
      medicineColor: '',
      startDate: null,
      endDate: null,
      instructions: ''
    }
  })

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if(medicationTask){
      const {data, error} = await supabase
      .from('MedicationTask')
      .update(values)
      .eq('id', medicationTask.id);

    } else {
      const {data, error} = await supabase
      .from('MedicationTask')
      .insert({
        ...values
      })
    }
  }


  return(
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control}
          name='medicineColor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className='w-full mt-4'>Submit</Button>
      </form>
    </Form>
  )
}

export default MedicationTaskForm