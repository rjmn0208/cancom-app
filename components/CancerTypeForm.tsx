'use client'

import { CancerType } from "@/lib/types";
import { z } from "zod";

const formSchema = z.object({
  name: z.string()
});

type FormSchemaType = z.infer<typeof formSchema>;

interface CancerTypeFormProps {
  cancerType?: Partial<CancerType>
}

import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const CancerTypeForm: React.FC<CancerTypeFormProps>= ({cancerType}) => {

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (cancerType)
      ? {
          name: cancerType.name
        }
      : {
          name: ''
        },
  });

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()

    if(cancerType) {
      const {data, error} = await supabase
      .from('CancerType')
      .update({
        ...values
      })
      .eq('id', cancerType.id)
      
      if(!error) toast.success('Cancer type editted successfully')
    } else {
      const {data, error} = await supabase
      .from('CancerType')
      .insert([{
        ...values
      }])
      
      if(!error) toast.success('Cancer type saved successfully')
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
              <FormLabel>Cancer Type Name:</FormLabel>
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

export default CancerTypeForm