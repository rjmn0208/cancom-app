"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Ellipsis, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Task, TaskType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TaskForm from "@/components/TaskForm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/utils/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"


const handleDelete = async (task: Task) => {
  const supabase = createClient()
  const {data, error} = await supabase
  .from('Task')
  .delete()
  .eq('id', task.id)
}

export const columns: ColumnDef<Task>[] = [
  
  { 
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-bold">{row.getValue("title")}</div>
    },
   },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt: Date = row.getValue("createdAt")
      return <div>{createdAt.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "type",
    header: 'Type',
    cell: ({ row }) => {
      const type: TaskType = row.getValue('type')
      return <Badge variant={'outline'}>{type}</Badge>
    }
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type: TaskType = row.getValue('priority')
      return <Badge variant={'outline'}>{type}</Badge>
    }
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate: Date = row.getValue("dueDate")
      return <div>{dueDate.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "isArchived",
    header: 'Archived?',
    cell: ({ row }) => {
      const isArchived: boolean = row.getValue('isArchived')
      return (
        <Badge variant={'outline'}>
          {(isArchived)? 'TRUE': 'FALSE'}
        </Badge>
      )

    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
 
      return (
        <>
          <Sheet>
              <SheetTrigger>
                <Button variant={'outline'}>Edit</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Input Task Details</SheetTitle>
                </SheetHeader>
                <TaskForm task={task} />
              </SheetContent>
            </Sheet>
          <Button 
            variant={'destructive'} 
            onClick={() => {handleDelete(task)}}>
              Delete Task
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Ellipsis/>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{task.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <h4 className="text-sm font-medium">Created By: </h4>
                <p className="mt-1 text-sm text-gray-500">{task.CreatedBy.firstName} {task.CreatedBy.middleName} {task.CreatedBy.lastName}</p>

                <h4 className="text-sm font-medium">Description: </h4>
                <p className="mt-1 text-sm text-gray-500">{task.description}</p>

                <h4 className="text-sm font-medium">Finish Date: </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {task.finishDate 
                      ? new Date(task.finishDate).toLocaleDateString() 
                      : 'Not set'}
                  </p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
  
]
