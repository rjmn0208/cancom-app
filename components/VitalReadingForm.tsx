"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Patient, User, Vitals } from "@/lib/types"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "./ui/badge"

const vitalSchema = z.object({
  id: z.number(),
  name: z.string(),
  unitOfMeasure: z.string(),
  description: z.string(),
  value: z.number().nullable(),
})

const formSchema = z.object({
  recordedBy: z.string({
    required_error: "Please select who recorded the vitals.",
  }),
  patientId: z.number({
    required_error: "Please select a patient.",
  }),
  vitalsData: z.array(vitalSchema),
  timestamp: z.date({
    required_error: "Please select a date and time.",
  })
})

type FormSchemaType = z.infer<typeof formSchema>


const VitalReadingForm = () => {
  const [users, setUsers] = useState<User[]>([]) 
  const [patients, setPatients] = useState<Patient[]>([])
  const [vitals, setVitals] = useState<Vitals[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordedBy: "",
      patientId: undefined,
      vitalsData: [
        { name: "Heart Rate", unitOfMeasure: "bpm", description: "Heart rate", value: 0 },
        { name: "Blood Pressure (Systolic)", unitOfMeasure: "mmHg", description: "Systolic blood pressure", value: 0 },
        { name: "Blood Pressure (Diastolic)", unitOfMeasure: "mmHg", description: "Diastolic blood pressure", value: 0 },
        { name: "SpO2", unitOfMeasure: "%", description: "Blood oxygen saturation", value: 0 },
        { name: "Temperature", unitOfMeasure: "°C", description: "Body temperature", value: 0 },
      ],
      timestamp: new Date(),
    },
  })

  const fetchUsers =async () => { 
    const supabase = createClient()

    const {data, error} = await supabase
    .from('User')
    .select('*')
    
    if(!error) setUsers(data)
    
    }

    const fetchPatients = async () => { 
      const supabase = createClient()

      const {data, error} = await supabase
      .from('Patient')
      .select(`*, User(*)`)
      
      if(!error) setPatients(data)
      
    }

    const fetchVitals = async () => {
      const supabase = createClient()

      const {data, error} = await supabase
      .from('Vitals')
      .select('*')

      if(!error) setVitals(data)
    }

    const onSubmit = async (values: FormSchemaType) => {
      const supabase = createClient();
      
      const vitalReadings = values.vitalsData.map((vital) => {
        const vitalRecord = vitals.find((v) => v.name === vital.name);

        if (!vitalRecord) {
          throw new Error(`No matching vital found for name: ${vital.name}`);
        }

        return {
          recordedBy: values.recordedBy,
          patientId: values.patientId,
          value: vital.value,
          timestamp: values.timestamp,
          lastEditedBy: values.recordedBy,
          vitalsId: vitalRecord.id,
        };
      });

      const { error } = await supabase.from("VitalReading").insert(vitalReadings);

      if (error) throw error;

      toast.success("Vital readings recorded successfully");

    };

  useEffect(() => {
    fetchUsers()
    fetchPatients();
    fetchVitals()
  }, [])
  

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Input Vital Reading Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recorded By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Recorder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div>
                              {user.firstName} {" "}
                              {user.middleName} {" "}
                              {user.lastName} {" "}
                            
                            </div>
                            <Badge className="my-2">
                              {user.userType}
                            </Badge>
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
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.User.firstName} {" "}
                            {patient.User.middleName} {" "}
                            {patient.User.lastName} {" "}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Systolic BP</TableHead>
                  <TableHead>Diastolic BP</TableHead>
                  <TableHead>SPO2</TableHead>
                  <TableHead>Temperature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                  <FormField
                    control={form.control}
                    name="timestamp"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date:</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={
                              field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""
                            }
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </TableCell>

                  {form.watch('vitalsData').map((vital, index) => (
                    <TableCell key={vital.id}>
                      <FormField
                        control={form.control}
                        name={`vitalsData.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.valueAsNumber))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  ))}
                  
                </TableRow>
              </TableBody>
            </Table>

            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default VitalReadingForm

