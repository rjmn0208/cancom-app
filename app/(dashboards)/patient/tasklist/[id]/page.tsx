import { Task, TaskPriority, TaskType } from "@/lib/types";
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from "@/utils/supabase/server";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskForm from "@/components/TaskForm";
import { ScrollArea } from "@/components/ui/scroll-area";



export default async function TaskListPage({params}: {params: {id: string}}) {
  const supabase = createClient()
  
  const {data: taskData, error: taskError}= await supabase
  .from('Task')
  .select('*')
  .eq('taskListId', params.id)

  return (
    <div className="container mx-auto py-10">
      
      <DataTable columns={columns} data={taskData as Task[]}/> 
    </div>
  )
}