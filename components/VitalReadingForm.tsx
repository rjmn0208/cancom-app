'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Patient, VitalReading, Vitals } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';

const formSchema = z.object({
  recordedBy: z.string(),
  patientId: z.number().positive(),
  value: z.number().finite(),
  vitalsId: z.number().positive(),
})

type FormSchemaType = z.infer<typeof formSchema>;

interface VitalReadingFormProps {
  vitalReading?: Partial<VitalReading>
}
const VitalReadingForm: React.FC<VitalReadingFormProps> = ({vitalReading}) => {
  const [vitals, setVitals] = useState<Vitals[] | null>([]);
  const [patients, setPatients] = useState<Patient[] | null>([]);
  
  const fetchVitals = async() => {
    const supabase = createClient();
    const {data: Vitals, error: vitalsError} = await supabase
    .from('Vitals')
    .select(`*`)

    setVitals(Vitals)
  }

  const fetchPatients = async() => {
    const supabase = createClient();

    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select(`*, User(*)`)

      setPatients(patientData);
  }

  useEffect(() => {

    fetchVitals();
    fetchPatients();
  }, []);

  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (vitalReading)? {
      recordedBy: vitalReading.recordedBy,
      patientId: vitalReading.patientId,
      value: vitalReading.value,
      vitalsId: vitalReading.vitalsId
    }:
    {
      recordedBy: '',
      patientId: 0,
      value: 0,
      vitalsId: 0,
    }

  })

  const onSubmit = async (values: FormSchemaType) => {
    if(vitalReading){
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      const {data, error} = await supabase
      .from('VitalReading')
      .update({
        recordedBy: user?.id,
        patientId: values.patientId,
        value: values.value,
        vitalsId: values.vitalsId,
        createdAt: new Date().toISOString()
      })
      .eq('id', vitalReading.id)
    }else {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      const {data, error} = await supabase
      .from('VitalReading')
      .insert({
        recordedBy: user?.id,
        patientId: values.patientId,
        value: values.value,
        vitalsId: values.vitalsId,
        createdAt: new Date().toISOString()
      })
      .select()
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField 
          control={form.control}
          name='patientId'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Patient:</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(Number(value))} // Convert string to number when setting
                defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Patient"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {patients?.map((patient: Patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.User.firstName} {patient.User.middleName} {patient.User.lastName}
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
          name='vitalsId'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Vital:</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(Number(value))} // Convert string to number when setting
                defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder=""/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {vitals?.map((vital: Vitals) => (
                    <SelectItem key={vital.id} value={vital.id.toString()}>
                      {vital.name} <p>({vital.unitOfMeasure})</p>
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
          name='value'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value:</FormLabel>
              <FormControl>
                <Input {...field} 
                  type='number'
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  />
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

export default VitalReadingForm