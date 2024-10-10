import { Task, TaskPriority, TaskType } from "@/lib/types";
import { columns } from "./columns"
import { DataTable } from "./data-table"

const tasks: Partial<Task[]> = [
  {
    id: 1,
    taskList: 101,
    createdAt: new Date('2024-09-28T10:30:00Z'),
    title: 'Submit project proposal',
    type: 'GENERAL' as TaskType,
    description: 'Submit the final project proposal to the client',
    priority: 'LOW' as TaskPriority,
    dueDate: new Date('2024-10-05'),
    finishDate: new Date('2024-10-04'),
    isDone: true,
    isArchived: false,
    PrerequisiteTask: null
  },
  {
    id: 2,
    taskList: 102,
    createdAt: new Date('2024-09-20T08:00:00Z'),
    title: 'Doctor Appointment',
    type: 'APPOINTMENT' as TaskType,
    description: 'Regular health check-up with Dr. Smith',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: new Date('2024-09-30'),
    isDone: false,
    isArchived: false,
    PrerequisiteTask: null
  },
  {
    id: 3,
    taskList: 103,
    createdAt: new Date('2024-09-18T09:45:00Z'),
    title: 'Prepare presentation slides',
    type: 'GENERAL' as TaskType,
    description: 'Prepare slides for the upcoming quarterly business review',
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date('2024-09-29'),
    isDone: false,
    isArchived: false,
    PrerequisiteTask: 1 // Assuming this task depends on the project proposal
  },
  {
    id: 4,
    taskList: 104,
    createdAt: new Date('2024-09-12T14:15:00Z'),
    title: 'Take morning medication',
    type: 'MEDICATION' as TaskType,
    description: 'Take prescribed medications after breakfast',
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date('2024-09-13'),
    finishDate: new Date('2024-09-13'),
    isDone: true,
    isArchived: true,
    PrerequisiteTask: null
  },
  {
    id: 5,
    taskList: 105,
    createdAt: new Date('2024-09-26T11:20:00Z'),
    title: 'Write journal entry',
    type: 'JOURNAL' as TaskType,
    description: 'Reflect on the progress made this week',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: new Date('2024-09-27'),
    finishDate: new Date('2024-09-27'),
    isDone: true,
    isArchived: false,
    PrerequisiteTask: null
  }
];

export default async function TaskListPage({params}: {params: {id: string}}) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={tasks} />
    </div>
  )
}