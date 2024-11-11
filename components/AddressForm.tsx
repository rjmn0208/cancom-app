
import React from 'react'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Address, AddressType } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const formSchema = z.object({
  addressLineOne: z.string(),
  addressLineTwo: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  country: z.string(),
  type: z.enum(['PERMANENT', 'CURRENT']).nullable()
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
      type: address.type
    }: {
      addressLineOne: '',
      addressLineTwo: '',
      city: '',
      province: '',
      postalCode: '',
      country: '',
      type: null
    }
  })

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    const {data: {user}} = await supabase.auth.getUser()
    console.log(values)
    if (address) {
      const { data, error } = await supabase
        .from('Address')
        .update(values)
        .eq('id', address.id);

        if (!error) toast.success('Address edited successfully')

    } else {
      const { data, error } = await supabase
        .from('Address')
        .insert([
          {
            ...values,
            userId: user?.id
          },
        ])
        
        if (!error) toast.success('Address saved successfully')

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
        <FormField 
          control={form.control}
          name='type'
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Address Type:</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Address Type"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {['PERMANENT', 'CURRENT'].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage/>
            </FormItem>
          )}  
        />
        <Button type="submit" className='w-full mt-4'>Submit</Button>
      </form>
    </Form>
  )
}

export default AddressForm