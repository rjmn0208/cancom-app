"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TaskListPage = () => {
  const [taskListId, setTaskListId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const fetchPatientId = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    const { data: patientData, error: patientError } = await supabase
      .from("Patient")
      .select("id")
      .eq("userId", user.id)
      .single();

    if (patientError) {
      throw new Error("Could not fetch patient data");
    }

    return patientData.id;
  };

  const createTaskList = async (patientId: number) => {
    const { data, error } = await supabase
      .from("TaskList")
      .insert([{
        completedTasksCount: 0,
        uncompletedTasksCount: 0,
        patientId: patientId,
      }])
      .select();

    if (error) {
      throw new Error("Failed to create task list");
    }

    return data[0].id;
  };

  const handleCreateTaskList = async () => {
    try {
      setIsLoading(true);
      const patientId = await fetchPatientId();
      const newTaskListId = await createTaskList(patientId);
      setTaskListId(newTaskListId);
      router.push(`/patient/task-list/${newTaskListId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const fetchExistingTaskList = async () => {
    try {
      const patientId = await fetchPatientId();
      const { data: taskListData, error: taskListError } = await supabase
        .from("TaskList")
        .select("id")
        .eq("patientId", patientId)
        .single();

      if (taskListError) {
        throw new Error("No existing task list found");
      }

      setTaskListId(taskListData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingTaskList();
  }, []);

  useEffect(() => {
    if (taskListId) {
      router.push(`/patient/task-list/${taskListId}`);
    }
  }, [taskListId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>
            {error ? "Error Occurred" : 
             isLoading ? "Fetching data..." : 
             taskListId ? "Redirecting..." : 
             "You Have No Task List"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          <Button
            onClick={handleCreateTaskList}
            disabled={isLoading}
            className="w-full max-w-xs"
          >
            Generate Task List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskListPage;