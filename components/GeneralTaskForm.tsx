'use client'

import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { format } from "date-fns"
import { createClient } from "@/utils/supabase/client"
import { Task, TaskType } from "@/lib/types"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable(),
  dueDate: z.date().nullable(),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number().nullable(),
  parentTaskId: z.number().nullable()
})
type FormSchemaType = z.infer<typeof formSchema>

interface TaskFormProps {
  task?: Partial<Task>
  taskListId?: number
} 

const validateDueDate = (dueDate: Date) => {
  return dueDate < new Date() ? 'Due date must be after the current date' : null
}

const GeneralTaskForm: React.FC<TaskFormProps>= ({task, taskListId}) => {
  const [tasks, setTasks] = useState<Task[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: task 
      ? {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: (task.dueDate) ? new Date(task.dueDate): null,
          isDone: task.isDone,
          isArchived: task.isArchived,  
          prerequisiteTaskId: task.prerequisiteTaskId,
          parentTaskId: task.parentTaskId,
        } 
      : {
          title: '',
          description: '',
          priority: null,
          dueDate: null,
          isDone: false,
          isArchived: false,
          prerequisiteTaskId: null,
          parentTaskId: null,  
        }
  })

  const fetchTasks = async () => {
    const supabase = createClient()

    const {data, error} = await supabase 
    .from('Task')
    .select('*')
    .eq('taskListId', (taskListId) ? taskListId: task?.taskListId)
    .eq('isDone', false)

    if(!error) setTasks(data)
  }

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()
    if(values.dueDate) {
      const validationError = validateDueDate(values?.dueDate)
      if (validationError && !task) {
        toast.error(validationError)
        return
      }
    }
    if (task) {
      const { data, error } = await supabase
        .from('Task')
        .update(values)
        .eq('id', task.id)
        .select()
      if (!error) {
        toast.success('Task edited successfully')
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('Task')
        .insert({
          ...values,
          type: TaskType.GENERAL,
          taskListId: taskListId,
          taskCreator: user?.id
        })
        .select()
      if (!error) {
        toast.success('Task saved successfully')
      }
    }
  }

  useEffect(() => {
    if (taskListId || task) {
      fetchTasks();
    }
  }, [taskListId, task]);
  

  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name='title'
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
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
              <FormLabel>Priority</FormLabel>
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
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
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
          name="isDone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!task}
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
          name='parentTaskId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Task</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
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
                Select a task to set this one as its subtask. Leave blank if this task has no parent.
              </FormDescription>
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

export default GeneralTaskForm