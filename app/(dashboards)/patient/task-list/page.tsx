'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const TaskListPage = () => {
  const [taskListId, setTaskListId] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const supabase = createClient();
  const router = useRouter();

  const getPatientAndTaskListIds = async () => {
  
    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('id')
      .single();
    
    setPatientId(patientData?.id)
  
    const { data: taskListData, error: taskListError } = await supabase
      .from('TaskList')
      .select('id')
      .eq('patientId', patientId)
      .single()
    
    setTaskListId(taskListData?.id)

  };

  useEffect(() => {
    setIsLoading(true)
    getPatientAndTaskListIds();
    if(taskListId){
      router.push(`/patient/task-list/${taskListId}`)
    }
    setIsLoading(false)
  }, [taskListId]); 

  const handleCreateTaskList = async () => {
    const { data, error } = await supabase
      .from('TaskList')
      .insert([{ 
        patientId: patientId,
         
      }])
      .select()

    if (data) {
      setTaskListId(data[0].id); 
      router.push(`/patient/task-list/${data[0].id}`); 
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>
            {isLoading ? 'Fetching data...' : taskListId ? 'Redirecting...' : 'You Have No Task List'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleCreateTaskList} disabled={isLoading && taskListId == null}>
            Generate Task List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskListPage;