"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ViewTaskLists() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);

  const fetchTaskLists = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: taskListIdsData, error: taskListIdError } = await supabase
      .from("ListMembership")
      .select("taskListId")
      .eq("userId", user?.id);

    if (taskListIdError) throw new Error(taskListIdError.message);

    const taskListIds = taskListIdsData.map((item) => item.taskListId);

    const { data: taskListData, error: taskListError } = await supabase
      .from("TaskList")
      .select(
        `
        *, Patient (*, User (*))
      `,
      )
      .in("id", taskListIds);

    if (!taskListError) setTaskLists(taskListData);
  };

  useEffect(() => {
    fetchTaskLists();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Task Lists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taskLists.map((list: TaskList) => (
          <Card
            key={list.id}
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <CardTitle className="text-lg">
                {list.Patient?.User.firstName} {list.Patient?.User.middleName}{" "}
                {list.Patient?.User.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>{list.completedTasksCount} completed</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span>{list.uncompletedTasksCount} pending</span>
                </div>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href={`/doctor/view-tasklist/task-list/${list.id}`}>
                  View Tasks
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {taskLists.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No task lists found.
        </p>
      )}
    </div>
  );
}
