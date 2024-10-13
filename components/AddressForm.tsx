
import React from 'react'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Address } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';

const formSchema = z.object({
  addressLineOne: z.string(),
  addressLineTwo: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  country: z.string(),
})

type FormSchemaType = z.infer<typeof formSchema>;

interface AddressFormProps {
  address?: Address
}

const AddressForm: React.FC<AddressFormProps>= ({address}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (address) ? {
      addressLineOne: address.addressLineOne,
      addressLineTwo: address.addressLineTwo,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
    }: {
      addressLineOne: '',
      addressLineTwo: '',
      city: '',
      province: '',
      postalCode: '',
      country: '',
    }
  })

  const onSubmit = async (values: FormSchemaType) => {
    if (address) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Address')
        .update({
          addressLineOne: values.addressLineOne,
          addressLineTwo: values.addressLineTwo,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode,
          country: values.country,
        })
        .eq('id', address.id);
    } else {
      const supabase = createClient();
      const {data: {user}} = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('Address')
        .insert([
          {
            userId: user?.id,
            addressLineOne: values.addressLineOne,
            addressLineTwo: values.addressLineTwo,
            city: values.city,
            province: values.province,
            postalCode: values.postalCode,
            country: values.country,
          },
        ])
        .select();
    }
  }

  
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
          control={form.control}
          name='addressLineOne'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line One:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='addressLineTwo'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line Two:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>City: </FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='province'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='postalCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country:</FormLabel>
              <FormControl>
                <Input {...field} type='text'/>
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

export default AddressForm