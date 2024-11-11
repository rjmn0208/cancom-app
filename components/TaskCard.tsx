import React from 'react'
import { Task, TaskType, TaskPriority, MedicationTask, } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, CheckCircleIcon, ClockIcon, UserIcon, Trash2Icon, UndoIcon, Pill, Stethoscope, Dumbbell, Syringe, EditIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import AppointmentTaskForm from './AppointmentTaskForm'
import MedicationTaskForm from './MedicationTaskForm'
import TreatmentTaskForm from './TreatmentTaskForm'
import ExerciseTaskForm from './ExerciseTaskForm'
import GeneralTaskForm from './GeneralTaskForm'

interface TaskCardProps {
  task: Task
  onDelete: (task: Task) => void
  onComplete: (task: Task) => void
  onUndoComplete?: (task: Task) => void
  onOpenChange: (open: boolean) => void
  isCompleted?: boolean
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onComplete, onUndoComplete, onOpenChange, isCompleted = false }) => {
  const handleAction = (action: 'delete' | 'complete' | 'undoComplete') => {
    switch (action) {
      case 'delete':
        onDelete(task)
        break
      case 'complete':
        onComplete(task)
        break
      case 'undoComplete':
        onUndoComplete?.(task)
        break
    }
    onOpenChange(false)
  }

  const getMedicineColor = (medicineColor: string) => {
    // Split the color string and handle each part
    const colors = medicineColor.split('/').map(color => color.trim().toLowerCase());
    
    // Join colors into a linear gradient if there are multiple
    const background = colors.length > 1 
      ? `linear-gradient(90deg, ${colors.join(', ')})` 
      : colors[0];
  
    return { background };
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-500 text-black';
      case 'MEDIUM':
        return 'bg-yellow-500 text-black';
      case 'HIGH':
        return 'bg-orange-500 text-black';
      case 'CRITICAL':
        return 'bg-red-500 text-black';
      default:
        return 'bg-gray-500 text-black';
    }
  };

  const renderTaskTypeDetails = () => {
    switch (task.type) {
      case TaskType.APPOINTMENT:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Stethoscope className="w-4 h-4 mr-2" />
              Appointment Details:
            </p>
            <p className="text-sm opacity-70">
              Doctor: {
                task.AppointmentTask[0]?.Doctor?.User
                  ? `${task.AppointmentTask[0].Doctor.User.firstName} ${task.AppointmentTask[0].Doctor.User.middleName ?? ''} ${task.AppointmentTask[0].Doctor.User.lastName}`
                  : 'N/A'
              }
            </p>
            <p className="text-sm opacity-70">Date: {new Date(task.AppointmentTask[0].appointmentDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</p>
            <p className="text-sm opacity-70">Purpose: {task.AppointmentTask[0].purpose}</p>
            {task.AppointmentTask[0].doctorsNotes && <p className="text-sm opacity-70">Notes: {task.AppointmentTask[0].doctorsNotes}</p>}
          </div>
        )
      case TaskType.EXERCISE:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercise Details:
            </p>
            <p className="text-sm opacity-70">Name: {task.ExerciseTask[0].name}</p>
            <p className="text-sm opacity-70">Sets: {task.ExerciseTask[0].sets}, Reps: {task.ExerciseTask[0].reps}</p>
            <p className="text-sm opacity-70">Duration: {task.ExerciseTask[0].durationPerSet}m/set, {task.ExerciseTask[0].durationPerRep}m/rep</p>
          </div>
        )
      case TaskType.MEDICATION:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Medication Details:
            </p>
            <p className="text-sm opacity-70">Name: {task.MedicationTask[0].name}</p>
            <div className="text-sm opacity-70">
              <span>Color: </span>
              <Badge style={getMedicineColor(task.MedicationTask[0].medicineColor)}>
                {task.MedicationTask[0].medicineColor}
              </Badge>           
            </div>
            <p className="text-sm opacity-70">Dosage: {task.MedicationTask[0].dosage} mg</p>
            <p className="text-sm opacity-70">Period: {new Date(task.MedicationTask[0].startDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} - {new Date(task.MedicationTask[0].endDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</p>
            <p  className="text-sm opacity-70" >Cron Job: {task.MedicationTask[0].cronExpression}</p>
            {task.MedicationTask[0].instructions && <p className="text-sm opacity-70">Instructions: {task.MedicationTask[0].instructions}</p>}
          </div>
        )
      case TaskType.TREATMENT:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Syringe className="w-4 h-4 mr-2" />
              Treatment Details:
            </p>
            <p className="text-sm opacity-70">Type: {task.TreatmentTask[0].treatmentType}</p>
            <p className="text-sm opacity-70">Date: {new Date(task.TreatmentTask[0].date).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</p>
            {task.TreatmentTask[0].dosage && <p className="text-sm opacity-70">Dosage: {task.TreatmentTask[0].dosage} Units</p>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className={`w-full ${task.isArchived ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <CardDescription>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Created: {new Date(task.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
          {task.dueDate && (
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">Due: {new Date(task.dueDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
            </div>
          )}
          {task.taskCreator && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">Created by: {task.TaskCreator.firstName} {task.TaskCreator.middleName} {task.TaskCreator.lastName}</span>
            </div>
          )}
          {renderTaskTypeDetails()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isCompleted && task.finishDate ? (
          <>
          <p className="text-sm font-bold" >
              Date Completed: {new Date(task.finishDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
            </p>
            <Button variant="outline" onClick={() => handleAction('undoComplete')}>
              <UndoIcon className="w-4 h-4" />
            </Button>
            <Button variant="destructive" onClick={() => handleAction('delete')}>
              <Trash2Icon className="w-4 h-4 " />
            </Button>
          </>
        ) : (
          <>
            <Dialog onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                  <Button variant="outline">
                  <EditIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="h-4/5 overflow-y-auto w-11/12">
                <DialogHeader>
                  <DialogTitle className='text-lg'>
                    Now editting task titled <p className='italic'>"{task.title}"</p>
                  </DialogTitle>
                  <DialogDescription>Fill in the necessary details</DialogDescription>
                </DialogHeader>
                  {task.type === TaskType.GENERAL && <GeneralTaskForm task={task} />}
                  {task.type === TaskType.APPOINTMENT && <AppointmentTaskForm appointmentTask={{...task, ...task.AppointmentTask[0]}} />}
                  {task.type === TaskType.MEDICATION && <MedicationTaskForm medicationTask={{ ...task, ...task.MedicationTask[0] }} />}                  
                  {task.type === TaskType.EXERCISE && <ExerciseTaskForm exerciseTask={{...task, ...task.ExerciseTask[0]}} />}
                  {task.type === TaskType.TREATMENT && <TreatmentTaskForm treatmentTask={{...task, ...task.TreatmentTask[0]}}/>}
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => handleAction('complete')}>
              <CheckCircleIcon className="w-4 h-4" />
            </Button>
            <Button variant="destructive" onClick={() => handleAction('delete')}>
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export default TaskCard