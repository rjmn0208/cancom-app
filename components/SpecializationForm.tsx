'use client'

import { CancerType, Specialization } from "@/lib/types";
import { z } from "zod";
import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string()
});

type FormSchemaType = z.infer<typeof formSchema>;

interface SpecializationFormProps {
  specialization?: Partial<Specialization>
}



const SpecializationForm: React.FC<SpecializationFormProps>= ({specialization}) => {

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (specialization)
      ? {
          name: specialization.name
        }
      : {
          name: ''
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()

    if(specialization) {
      const {data, error} = await supabase
      .from('Specialization')
      .update({
        ...values
      })
      .eq('id', specialization.id)
      
      if(!error) toast.success('Specialization editted successfully')
    } else {
      const {data, error} = await supabase
      .from('Specialization')
      .insert([{
        ...values
      }])
      
      if(!error) toast.success('Specialization saved successfully')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization Name:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </Form>
  )
}

export default SpecializationForm