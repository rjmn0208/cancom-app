"use client"

import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns";
import { Patient } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";


const formSchema = z.object({
  cancerType: z.string(),
  cancerStage: z.enum(['STAGE_0', 'STAGE_I', 'STAGE_II', 'STAGE_III', 'STAGE_IV']),
  diagnosisDate: z.date(),
})

type FormSchemaType = z.infer<typeof formSchema>;

interface PatientFormProps {
  patient?: Partial<Patient>
}

const PatientForm: React.FC<PatientFormProps> = ({patient}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues:  (patient)? {
      cancerType: patient.cancerType,
      cancerStage: patient.cancerStage,
      diagnosisDate: patient.diagnosisDate
    }:{
      cancerType: '',
    }
  })

  const onSubmit = async(values: FormSchemaType) => {
    if(patient) {
      const supabase = createClient();
      const {data, error} = await supabase
      .from('Patient')
      .update({
        cancerType: values.cancerType,
        cancerStage: values.cancerStage,
        diagnosisDate: values.diagnosisDate.toISOString()
      })
      .eq('id', patient.id)
    } else {
      const supabase = createClient();
      const {data: {user}} = await supabase.auth.getUser()
      
      const {data, error} = await supabase
      .from('Patient')
      .insert({
        userId: user?.id,
        cancerType: values.cancerType,
        cancerStage: values.cancerStage,
        diagnosisDate: values.diagnosisDate.toISOString() 
      })  
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
          control={form.control}
          name='cancerType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancer Type:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField 
          control={form.control}
          name='cancerStage'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Cancer Stage:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder=""/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {["STAGE_0", "STAGE_I", "STAGE_II", "STAGE_III", "STAGE_IV"].map((value) => (
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
          name="diagnosisDate"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-3">
              <FormLabel>Diagnosis Date:</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
       <Button type="submit" className='w-full mt-4'>Submit</Button>
      </form>
    </Form>
  )
}

export default PatientForm