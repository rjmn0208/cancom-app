'use client'

import { AppointmentTask, Doctor } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "./ui/input";
import { format } from "date-fns";


const formSchema = z.object({
  taskId: z.number().nullable(),
  doctorId: z.number().nullable(),
  appointmentDate: z.date(),
  purpose: z.string().min(1, "Purpose is required"),
  doctorsNotes: z.string(), 
})

type FormSchemaType = z.infer<typeof formSchema>;

interface AppointmentTaskFormProps {
  appointmentTask?: Partial<AppointmentTask>
}


const AppointmentTaskForm: React.FC<AppointmentTaskFormProps>  = ({appointmentTask}) => {
  const [doctors, setDoctors] = useState<Doctor[] | null>([]);

  const fetchDoctors = async () => {
    const supabase = createClient()
    const {data, error} = await supabase
    .from('Doctor')
    .select('*, User(*)')

    if(!error){
      setDoctors(data)
    }
  }
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:  appointmentTask 
    ? {
      appointmentDate: appointmentTask.appointmentDate,
      purpose: appointmentTask.purpose,
      doctorsNotes: appointmentTask.doctorsNotes
    } : {
      taskId: null,
      doctorId: null,
      purpose: '',
      doctorsNotes: '',
    }
  })

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    console.log(values)
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

  useEffect(() => {
    fetchDoctors();
  }, []);
  
  return (
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor:</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  defaultValue={field.value?.toString() || ""}
                  >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                  {doctors?.map((doctor: Doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.User.firstName} {doctor.User.middleName} {doctor.User.lastName}
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
          name="appointmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Appointment Date:</FormLabel>
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