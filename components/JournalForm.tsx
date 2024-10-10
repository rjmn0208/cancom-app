'use client';

import { JournalEntry, Patient } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { createClient } from '@/utils/supabase/client';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

const formSchema = z.object({
  id: z.number().positive().optional(), // made optional
  patientId: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().min(1, "Mood is required"),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface JournalFormProps {
  journal?: Partial<JournalEntry>;
}

const JournalForm: React.FC<JournalFormProps> = ({ journal }) => {
  const [patient, setPatient] = useState<Patient | null>(null);

  const fetchPatient = async () => {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select(`*, User(*)`)
      .eq('userId', user?.id)
      .single();

    setPatient(patientData);
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: journal
      ? {
          id: journal.id ?? undefined,
          patientId: journal.patientId ?? undefined,
          title: journal.title ?? '',
          content: journal.content ?? '',
          mood: journal.mood ?? '',
        }
      : {
          title: '',
          content: '',
          mood: '',
        },
  });

  const onSubmit = async (values: FormSchemaType) => {

    if (!patient) {
      console.error("Patient data is not loaded.");
      return;
    }

    if (journal) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('JournalEntry')
        .update({
          patientId: patient.id, 
          title: values.title,
          content: values.content,
          mood: values.mood,
          createdAt: new Date().toISOString()
        })
        .eq('id', journal.id);
    } else {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('JournalEntry')
        .insert([
          {
            patientId: patient.id,
            title: values.title,
            content: values.content,
            mood: values.mood,
            createdAt: new Date().toISOString()
          },
        ])
        .select();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title:</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content:</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood:</FormLabel>
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
  );
};

export default JournalForm;
