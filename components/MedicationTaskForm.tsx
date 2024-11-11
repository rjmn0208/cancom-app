import { MedicationTask, Task, TaskType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";


const formSchema = z.object({
  //base task fields
  title: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable(),
  isDone: z.boolean(),
  isArchived: z.boolean(),
  prerequisiteTaskId: z.number().nullable(),
  subTaskId: z.number().nullable(),

  //medication task fields
  name: z.string(),
  medicineColor: z.string(),
  dosage: z.number(),
  instructions: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  cronExpression: z.string()
})

type FormSchemaType = z.infer<typeof formSchema>;

interface MedicationTaskFormProps {
  medicationTask?: Partial<MedicationTask>,
  taskListId?: number
}

const validateDates = (medTask: FormSchemaType) => {
  if(medTask.startDate && medTask.endDate)
    return medTask.startDate > medTask.endDate ? 'Start date must be less than end date': null
}

const MedicationTaskForm: React.FC<MedicationTaskFormProps> = ({medicationTask, taskListId}) => {
  const [tasks, setTasks] = useState<Task[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: medicationTask
    ? {
      //base task fields
      title: medicationTask.title,
      priority: medicationTask.priority,
      isDone: medicationTask.isDone,
      isArchived: medicationTask.isArchived,
      prerequisiteTaskId: medicationTask.prerequisiteTaskId,
      subTaskId: medicationTask.subTaskId,

      //medication task fields
      name: medicationTask.name,
      medicineColor: medicationTask.medicineColor,
      dosage: medicationTask.dosage,
      instructions: medicationTask.instructions,
      startDate: (medicationTask.startDate) ? new Date(medicationTask.startDate) : null,
      endDate: (medicationTask.endDate) ? new Date(medicationTask.endDate) : null,
      cronExpression: medicationTask.cronExpression
    } : {
      title: '',
      priority: null,
      isDone: false,
      isArchived: false,
      prerequisiteTaskId: null,
      subTaskId: null,

      //medication task fields
      name: '',
      medicineColor: '',
      dosage: 0,
      instructions: '',
      startDate: null,
      endDate: null,
      cronExpression: ''
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


  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();

    const validationError = validateDates(values);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if(medicationTask) {
      const {data: TaskData, error: TaskError} = await supabase
      .from('Task')
      .update({
        title: values.title,
        priority: values.priority,
        isDone: values.isDone,
        isArchived: values.isArchived,
        prerequisiteTaskId: values.prerequisiteTaskId,
        subTaskId: values.subTaskId,

      })
      .eq('id', medicationTask.taskId)
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)

      const {data: MedicationData, error: MedicationError} = await supabase
      .from('MedicationTask')
      .update({
        name: values.name,
        medicineColor: values.medicineColor,
        dosage: values.dosage,
        instructions: values.instructions,
        startDate: values.startDate,
        endDate: values.endDate,
        cronExpression: values.cronExpression
      })
      .eq('taskId', TaskData.id)

      if(!MedicationError) toast.success('Medication edited successfully')
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

        type: TaskType.MEDICATION
      }])
      .select()
      .single()

      if(TaskError) throw new Error(TaskError.message)

      const {data: MedicationData, error: MedicationError} = await supabase
      .from('MedicationTask')
      .insert([{
        taskId: TaskData.id,
        name: values.name,
        medicineColor: values.medicineColor,
        dosage: values.dosage,
        instructions: values.instructions,
        startDate: values.startDate,
        endDate: values.endDate,
        cronExpression: values.cronExpression
      }])

      if(!MedicationError) toast.success('Medication saved successfully')

    }

    
  }

  useEffect(() => {
    fetchTasks()
  }, [])
  

  return(
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
                  disabled={!medicationTask}
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
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Medicine Name:</FormLabel>
              <FormControl>
                <Input {...field} type='text' />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name='medicineColor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicine Color:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormDescription>
              If the medicine has multiple colors, enter them separated by a slash (e.g., white/red).              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name='dosage'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage:</FormLabel>
              <FormControl>
              <Input
                  type='number' 
                  {...field}
                  value={(field.value) ? Number(field.value)  : 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Enter in milligrams (mg)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name='instructions'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions:</FormLabel>
              <FormControl>
                <Textarea {...field}/>
              </FormControl>
              <FormDescription>You may add instruction on how the medicine should be taken</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date:</FormLabel>
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
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date:</FormLabel>
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
          name='cronExpression'
          render={({ field }) => (
            <FormItem>
              <FormLabel {...field}>Cron Expression (Set the frequency of the medication)</FormLabel>
              <FormControl>
                <Input {...field} 
                  type="text"
                  placeholder="* * * * *"/>
              </FormControl>
              <FormDescription>
                <div className="p-2">Enter a cron expression to set the frequency of the medication schedule. </div>
                <div className="p-2">Format: * * * * * (minute, hour, day of month, month, day of week). </div>
                <div className="p-2">Examples: "0 */4 * * *" for every 4 hours, "0 8,12,16 * * *" for 3 times a day at 8am, 12pm, 4pm.</div>
              </FormDescription>
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

export default MedicationTaskForm