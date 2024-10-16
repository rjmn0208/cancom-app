"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Task, TaskType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import VitalReadingForm from "@/components/VitalReadingForm"
import TaskForm from "@/components/TaskForm"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
 
      return (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'outline'}>Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>  
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
                <ScrollArea className="w-full rounded-md border max-h-[500px]" >
                  <div className="p-4">
                    <TaskForm task={task} />
                  </div>
                </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button>Delete Task</Button>
        </>
      )
    },
  },
  
]
