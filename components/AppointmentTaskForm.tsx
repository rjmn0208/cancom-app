'use client'

import { AppointmentTask } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Textarea } from "./ui/textarea";



const formSchema = z.object({
  id: z.number(),
  taskId: z.number(),
  doctorId: z.number(),
  appointmentDate: z.date(),
  purpose: z.string(),
  doctorsNotes: z.string(), 
})

type FormSchemaType = z.infer<typeof formSchema>;

interface AppointmentTaskFormProps {
  appointmentTask?: Partial<AppointmentTask>
}


const AppointmentTaskForm: React.FC<AppointmentTaskFormProps>  = ({appointmentTask}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:  appointmentTask ? {
      taskId: appointmentTask.taskId,
      doctorId: appointmentTask.doctorId,
      appointmentDate: appointmentTask.appointmentDate ? new Date(appointmentTask.appointmentDate) : new Date(),
      purpose: appointmentTask.purpose,
      doctorsNotes: appointmentTask.doctorsNotes
    } : {
      appointmentDate: new Date(),
      purpose: '',
      doctorsNotes: '',
    }
  })

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    if(appointmentTask) {
      const {data, error} = await supabase
        .from('AppointmentTask')
        .update(values)
        .eq('id', appointmentTask.id)
    } else {
      const {data: {user}} = await supabase.auth.getUser()
      const {data, error} = await supabase
        .from('AppointmentTask')
        .insert({
          ...values,
        })
    }
  }
  
  return (
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
          control={form.control}
          name="appointmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Finish Date:</FormLabel>
                <FormControl>
                  <Input 
                      type="datetime-local"  
                      {...field}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd\'T\'HH:mm') : ''}
                      onChange={(e) => {
                        field.onChange(new Date(e.target.value))
                      }}
                    />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='purpose'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose:</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='doctorsNotes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctors Notes:</FormLabel>
              <FormControl>
                <Textarea {...field} />
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

export default AppointmentTaskForm