'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { ClipboardList } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const TaskListPage = () => {
  const [taskListId, setTaskListId] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();  
  const getPatientId = async () => {
    const {data: {user}} = await supabase.auth.getUser();
    const {data, error} = await supabase
    .from('Patient')
    .select('id')
    .eq('userId', user?.id)
    .single()

    if(data){
      setPatientId(data.id)
    }
  }

  const handleCreateTaskList =  async () => {
    const {data, error} =  await supabase
    .from('TaskList')
    .insert([{
      patientId: patientId
    }])
  }

  const getTaskListId =  async () => {
    const {data, error} =  await supabase
    .from('TaskList')
    .select('id')
    .single()

    if(data){
      setTaskListId(data.id)
    }
  }

  useEffect(() => {
    getPatientId();
  }, []);

  // Redirect when taskListId is available
  useEffect(() => {
    if (taskListId) {
      router.push(`/patient/tasklist/${taskListId}`);  // Redirect to task list
    }
  }, [taskListId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>You Have No Task List Yet!</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button>
            Generate Task List
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskListPage

