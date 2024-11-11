'use client'

import { AppointmentTask, Doctor, Task, TaskType } from "@/lib/types";
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
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";


const formSchema = z.object({
  //base task fields
  title: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable(),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number().nullable(),
  subTaskId: z.number().nullable(),

  //appointment task fields
  doctorId: z.number().nullable(),
  appointmentDate: z.date().nullable(),
  purpose: z.string().min(1, "Purpose is required"),
  doctorsNotes: z.string(), 
})

type FormSchemaType = z.infer<typeof formSchema>;

interface AppointmentTaskFormProps {
  appointmentTask?: Partial<AppointmentTask>,
  taskListId?: number
}


const AppointmentTaskForm: React.FC<AppointmentTaskFormProps>  = ({appointmentTask, taskListId
}) => {
  const [doctors, setDoctors] = useState<Doctor[] | null>([]);
  const [tasks, setTasks] = useState<Task[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:  appointmentTask 
    ? {
      //base task fields
      title: appointmentTask.title,
      priority: appointmentTask.priority,
      isDone: appointmentTask.isDone,
      isArchived: appointmentTask.isArchived,
      prerequisiteTaskId: appointmentTask.prerequisiteTaskId,
      subTaskId: appointmentTask.subTaskId,

      //appointment task fields
      doctorId: appointmentTask.doctorId,
      appointmentDate: appointmentTask.appointmentDate ? new Date(appointmentTask.appointmentDate): null,
      purpose: appointmentTask.purpose,
      doctorsNotes: appointmentTask.purpose,
    } : {
      //base task fields
      title: '',
      priority: null,
      isDone: false,
      isArchived: false,
      prerequisiteTaskId: null,
      subTaskId: null,

      //appointment task fields
      doctorId: null,
      appointmentDate: null,
      purpose: '',
      doctorsNotes: '',
    }
  })

  const fetchTasks = async () => {
    const supabase = createClient()

    const {data, error} = await supabase 
    .from('Task')
    .select('*')
    .eq('taskListId', taskListId)
    .eq('isDone', false)

    if(!error) setTasks(data)
  }

  const fetchDoctors = async () => {
    const supabase = createClient()
    const {data, error} = await supabase
    .from('Doctor')
    .select('*, User(*)')

    if(!error){
      setDoctors(data)
    }
  }

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()
    if(appointmentTask) {
      const {data: TaskData, error: TaskError} = await supabase
      .from('Task')
      .update({
        title: values.title,
        priority: values.priority,
        isDone: values.isDone,
        isArchived: values.isArchived,
        prerequisiteTaskId: values.prerequisiteTaskId,
        subTaskId: values.subTaskId,

        dueDate: values.appointmentDate
      })
      .eq('id', appointmentTask.taskId)
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)
      

      const {data: AppointmentTaskData, error: AppointmentTaskError} = await supabase
      .from('AppointmentTask')
      .update({ 
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate,
        purpose: values.purpose,
        doctorsNotes: values.doctorsNotes,
      })
      .eq('taskId', TaskData.id)
      .select()

      if(!AppointmentTaskError) toast.success('Appointment edited sucessfully')
    
    } else {
      const {data: {user}} = await supabase.auth.getUser()

      const {data: TaskData, error: TaskError} = await supabase
      .from('Task')
      .insert([{
        taskListId: taskListId,
        title: values.title,
        priority: values.priority,
        isDone: values.isDone,
        isArchived: values.isArchived,
        prerequisiteTaskId: values.prerequisiteTaskId,
        subTaskId: values.subTaskId,
        taskCreator: user?.id,

        dueDate: values.appointmentDate,
        type: TaskType.APPOINTMENT
      }])
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)

      const {data: AppointmentTaskData, error: AppointmentTaskError} = await supabase
      .from('AppointmentTask')
      .insert([{ 
        taskId: TaskData.id,
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate,
        purpose: values.purpose,
        doctorsNotes: values.doctorsNotes,
      }])

      if(!AppointmentTaskError) toast.success('Appointment details saved sucessfully')
    }
    
  }

  useEffect(() => {
    fetchDoctors();
    fetchTasks();
  }, []);
  
  return (
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control}
          name='title'
          render={({field}) => (
            <FormItem>
              <FormLabel>Title:</FormLabel>
              <FormControl>
                <Input {...field} type='text' placeholder="Enter Title" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name='priority'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Priority:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage/>
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
                  disabled={!appointmentTask}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Done
                </FormLabel>
                <FormDescription>
                  Mark this task as completed
                </FormDescription>
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
                <FormLabel>
                  Archived
                </FormLabel>
                <FormDescription>
                  Mark this task as archived
                </FormDescription>
              </div>
            </FormItem>
          )}
        />


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
                    value={(field.value) ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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

          <FormField
            control={form.control}
            name='prerequisiteTaskId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisite Task</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
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
            name='subTaskId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtask</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  defaultValue={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subtask" />                  
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
        <Button type="submit" className='w-full mt-4'>Submit</Button>
      </form>
    </Form>
  )
}

export default AppointmentTaskForm