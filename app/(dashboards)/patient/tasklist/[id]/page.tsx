'use client'

import { Task } from "@/lib/types";
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


const TaskListPage = ({params}: {params: {id: string}}) => {
  const [tasks, setTasks] = useState<Task[] | null>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const taskListId = Number(params.id)
  const supabase = createClient()
  
  
  const fetchTasks = async() => {
    const {data, error} = await supabase
    .from('Task')
    .select('*')
    .eq('taskListId', taskListId)

    if(!error){
      setTasks(data)
    }
  }

  useEffect(() => {
    fetchTasks()
  },[])


  return (
    <div className="container mx-auto py-10">
      <Dialog>
        <DialogTrigger>
          <Button>Add Task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Task Details</DialogTitle>
            <TaskForm />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      
      <DataTable columns={columns} data={tasks || []}/> 
    </div>
  )
}

export default TaskListPage