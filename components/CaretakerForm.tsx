"use client"

import React from 'react'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Caretaker } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const formSchema = z.object({
  relationshipToPatient: z.enum(['FAMILY', 'FRIEND', 'COLLEAGUE', 'CARETAKER', 'OTHER', 'ACQUAINTANCE']),
  qualifications: z.string()
})

type FormSchemaType = z.infer<typeof formSchema>;

interface CaretakerFormProps {
  caretaker?: Caretaker
}
const CaretakerForm: React.FC<CaretakerFormProps> = ({caretaker}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (caretaker) ? {
      relationshipToPatient: caretaker.relationshipToPatient,
      qualifications: caretaker.qualifications
    }:{
      qualifications: ''
    }
  })  

  const onSubmit = async(values: FormSchemaType) => {
    const supabase = createClient();

    if (caretaker) {
      const { data, error } = await supabase
        .from('Caretaker')
        .update({
          relationshipToPatient: values.relationshipToPatient,
          qualifications: values.qualifications
        })
        .eq('id', caretaker.id);

        if(!error) toast.success('Caretaker information edited successfully')
    } else {
      const {data: {user}} = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('Caretaker')
        .insert([
          {
            ...values,
            userId: user?.id
          },
        ])
        .select();

        console.log(error)

        if(!error) toast.success('Caretaker information saved successfully')
    }
  }

  
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField 
          control={form.control}
          name='relationshipToPatient'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Relationship To Patient: </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder=""/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {['FAMILY', 'FRIEND', 'COLLEAGUE', 'CARETAKER', 'OTHER', 'ACQUAINTANCE'].map((value) => (
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
          name='qualifications'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications:</FormLabel>
              <FormControl>
              <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
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

export default CaretakerForm