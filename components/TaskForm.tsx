"use client"

import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { Task } from "@/lib/types";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(['GENERAL', 'MEDICATION', 'EXERCISE', 'APPOINTMENT']),
  description: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.date(),
  finishDate: z.date(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number()
})

type FormSchemaType = z.infer<typeof formSchema>;

interface TaskFormProps {
  task?: Partial<Task>
}

const TaskForm: React.FC<TaskFormProps> = ({task}) => {
  const [prereqTask, setPreReqTask] = useState<Task[] | null>([])
  /*
    /patient/tasklist/[id]
    
  */
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:  task ? {
      title: task.title,
      type: task.type,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      finishDate: task.finishDate ? new Date(task.finishDate) : new Date(),
      isArchived: task.isArchived,
      prerequisiteTaskId: task.prerequisiteTaskId
    } : {
      title: '',
      description: '',
      dueDate: new Date(),
      finishDate: new Date(),
      isArchived: false,
    }
  })

  const onSubmit = async(values: FormSchemaType) => {
    const supabase = createClient();
    if(task) {
      const {data, error} = await supabase
        .from('Task')
        .update(values)
        .eq('id', task.id)
    } else {
      const {data: {user}} = await supabase.auth.getUser()
      const {data, error} = await supabase
        .from('Task')
        .insert({
          ...values,
          userId: user?.id
        })  
    }
  }

  const fetchPreReqTasks = async () => {
    const supabase = createClient()
    const {data, error} = await supabase
    .from('Task')
    .select('*')
    .eq('taskListId', task?.taskListId)

    setPreReqTask(data)
  }

  useEffect(() => {
    fetchPreReqTasks()
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name='title'
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
        <FormField 
          control={form.control}
          name='type'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Type:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['GENERAL', 'MEDICATION', 'EXERCISE', 'APPOINTMENT'].map((value) => (
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description:</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField 
          control={form.control}
          name='priority'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Priority:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date:</FormLabel>
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
          name="finishDate"
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
          name='prerequisiteTaskId'
          render={({ field }) => (
            <FormItem>
              <Select 
                onValueChange={(value) => field.onChange(Number(value))} 
                defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder=""/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {prereqTask?.map((task: Task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title} <p>({task.type})</p>
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

export default TaskForm