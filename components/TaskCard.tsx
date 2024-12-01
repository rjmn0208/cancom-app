"use client";

import React, { useEffect, useState } from "react";
import {
  Task,
  TaskType,
  TaskPriority,
  MedicationTask,
  TaskTag,
  MedicationTaskSchedule,
  ListPermission,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  Trash2Icon,
  UndoIcon,
  Pill,
  Stethoscope,
  Dumbbell,
  Syringe,
  EditIcon,
  Ellipsis,
  Tag,
  X,
  LucideFlaskConical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import AppointmentTaskForm from "./AppointmentTaskForm";
import MedicationTaskForm from "./MedicationTaskForm";
import TreatmentTaskForm from "./TreatmentTaskForm";
import ExerciseTaskForm from "./ExerciseTaskForm";
import GeneralTaskForm from "./GeneralTaskForm";
import { createClient } from "@/utils/supabase/client";
import TaskTagForm from "./TaskTagForm";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onUndoComplete?: (task: Task) => void;
  onTagDelete: (tag: TaskTag) => void;
  onOpenChange: (open: boolean) => void;
  isCompleted?: boolean;
  onMedScheduleMarkTaken: (sched: MedicationTaskSchedule) => void;
  onMedScheduleDelete: (sched: MedicationTaskSchedule) => void;
  onMedScheduleUndoTaken: (sched: MedicationTaskSchedule) => void;
  permission?: ListPermission;
}

export default function TaskCard({
  task,
  onDelete,
  onComplete,
  onUndoComplete,
  onOpenChange,
  isCompleted = false,
  onTagDelete,
  onMedScheduleMarkTaken,
  onMedScheduleDelete,
  onMedScheduleUndoTaken,
  permission,
}: TaskCardProps) {
  const [subTasks, setSubTasks] = useState<Task[]>([]);
  const [prerequisites, setPrerequisites] = useState<Task[]>([]);

  const handleAction = (action: "delete" | "complete" | "undoComplete") => {
    switch (action) {
      case "delete":
        onDelete(task);
        break;
      case "complete":
        onComplete(task);
        break;
      case "undoComplete":
        onUndoComplete?.(task);
        break;
    }
    onOpenChange(false);
  };

  const getColor = (value: string | undefined) => {
    if (!value) {
      return { background: "gray" }; // fallback color if value is undefined
    }

    const colors = value.split("/").map((color) => color.trim().toLowerCase());
    const background =
      colors.length > 1
        ? `linear-gradient(90deg, ${colors.join(", ")})`
        : colors[0];

    return { background };
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW":
        return "bg-green-500 text-black";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "HIGH":
        return "bg-orange-500 text-black";
      case "CRITICAL":
        return "bg-red-500 text-black";
      default:
        return "bg-gray-500 text-black";
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
              Doctor:{" "}
              {task.AppointmentTask[0]?.Doctor?.User
                ? `${task.AppointmentTask[0].Doctor.User.firstName} ${task.AppointmentTask[0].Doctor.User.middleName ?? ""} ${task.AppointmentTask[0].Doctor.User.lastName}`
                : "N/A"}
            </p>
            <p className="text-sm opacity-70">
              Date:{" "}
              {new Date(task.AppointmentTask[0].appointmentDate).toLocaleString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              )}
            </p>
            <p className="text-sm opacity-70">
              Purpose: {task.AppointmentTask[0].purpose}
            </p>
            {task.AppointmentTask[0].doctorsNotes && (
              <div className="text-sm opacity-70">
                <p>Notes:</p>
                <div
                  className="max-h-32 overflow-y-auto p-2 rounded-md"
                  style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                >
                  {task.AppointmentTask[0].doctorsNotes}
                </div>
              </div>
            )}
          </div>
        );
      case TaskType.EXERCISE:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercise Details:
            </p>
            <p className="text-sm opacity-70">
              Name: {task.ExerciseTask[0].name}
            </p>
            <p className="text-sm opacity-70">
              Sets: {task.ExerciseTask[0].sets}, Reps:{" "}
              {task.ExerciseTask[0].reps}
            </p>
            <p className="text-sm opacity-70">
              Duration: {task.ExerciseTask[0].durationPerSet}m/set,{" "}
              {task.ExerciseTask[0].durationPerRep}m/rep
            </p>
          </div>
        );
      case TaskType.MEDICATION:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Medication Details:
            </p>
            <p className="text-sm opacity-70">
              Name: {task.MedicationTask[0].name}
            </p>
            <div className="text-sm opacity-70">
              <span>Color: </span>
              <Badge style={getColor(task.MedicationTask[0].medicineColor)}>
                {task.MedicationTask[0].medicineColor}
              </Badge>
            </div>
            <p className="text-sm opacity-70">
              Dosage: {task.MedicationTask[0].dosage} mg
            </p>
            <p className="text-sm opacity-70">
              Period:{" "}
              {new Date(task.MedicationTask[0].startDate).toLocaleString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              )}{" "}
              -{" "}
              {new Date(task.MedicationTask[0].endDate).toLocaleString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              )}
            </p>
            <div className="space-y-2">
              <h1 className="text-md font-semibold">Medication Schedules:</h1>
              {task.MedicationTask[0].MedicationTaskSchedule.map(
                (sched: MedicationTaskSchedule) => (
                  <div key={sched.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={sched.id.toString()}
                      checked={sched.isTaken}
                      onCheckedChange={(checked) => {
                        if (permission === ListPermission.MANAGER) {
                          checked
                            ? onMedScheduleMarkTaken(sched)
                            : onMedScheduleUndoTaken(sched);
                        }
                      }}
                      disabled={permission !== ListPermission.MANAGER}
                    />
                    <Label htmlFor={sched.id.toString()}>
                      {format(new Date(`1970-01-01T${sched.time}`), "hh:mm a")}
                    </Label>
                    {permission === ListPermission.MANAGER && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-0 w-5 h-5 flex items-center justify-center"
                        onClick={() => onMedScheduleDelete(sched)}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
            {task.MedicationTask[0].instructions && (
              <p className="text-sm opacity-70">
                Instructions: {task.MedicationTask[0].instructions}
              </p>
            )}
          </div>
        );
      case TaskType.TREATMENT:
        return (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold flex items-center">
              <Syringe className="w-4 h-4 mr-2" />
              Treatment Details:
            </p>
            <p className="text-sm opacity-70">
              Type: {task.TreatmentTask[0].treatmentType}
            </p>
            <p className="text-sm opacity-70">
              Date:{" "}
              {new Date(task.TreatmentTask[0].date).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            {task.TreatmentTask[0].dosage && (
              <p className="text-sm opacity-70">
                Dosage: {task.TreatmentTask[0].dosage} Units
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const fetchSubTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("parentTaskId", task.id);
    if (!error) setSubTasks(data);
  };

  const fetchPreReqTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("id", task.prerequisiteTaskId);
    if (!error) setPrerequisites(data);
  };

  useEffect(() => {
    fetchSubTasks();
    fetchPreReqTasks();
  }, []);

  return (
    <Card className={`w-full ${task.isArchived ? "opacity-50" : ""}`}>
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
            <span>
              Created:{" "}
              {new Date(task.createdAt).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          {task.dueDate && (
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">
                Due:{" "}
                {new Date(task.dueDate).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
          {task.taskCreator && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">
                Created by: {task.TaskCreator.firstName}{" "}
                {task.TaskCreator.middleName} {task.TaskCreator.lastName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isCompleted && task.finishDate ? (
          <>
            <p className="text-sm font-bold">
              Date Completed:{" "}
              {new Date(task.finishDate).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <Button
              variant="outline"
              onClick={() => handleAction("undoComplete")}
            >
              <UndoIcon className="w-4 h-4" />
            </Button>
            {permission === ListPermission.MANAGER && (
              <Button
                variant="destructive"
                onClick={() => handleAction("delete")}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Task Details</DialogTitle>
                  <DialogDescription>
                    View prerequisites and subtasks for this task.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Prerequisites:
                      </h3>
                      <ul className="list-disc list-inside">
                        {prerequisites.map((prereq) => (
                          <li key={prereq.id} className="text-sm">
                            {prereq.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {subTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Subtasks:</h3>
                      <ul className="list-disc list-inside">
                        {subTasks.map((subTask) => (
                          <li key={subTask.id} className="text-sm">
                            {subTask.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {renderTaskTypeDetails()}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Tag className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a tag to this task</DialogTitle>
                </DialogHeader>
                <TaskTagForm task={task} />
              </DialogContent>
            </Dialog>
            {permission === ListPermission.MANAGER && (
              <>
                <Dialog onOpenChange={onOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="h-4/5 overflow-y-auto w-11/12">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        Now editing task titled{" "}
                        <p className="italic">"{task.title}"</p>
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the necessary details
                      </DialogDescription>
                    </DialogHeader>
                    {task.type === TaskType.GENERAL && (
                      <GeneralTaskForm task={task} />
                    )}
                    {task.type === TaskType.APPOINTMENT && (
                      <AppointmentTaskForm
                        appointmentTask={{
                          ...task,
                          ...task.AppointmentTask[0],
                        }}
                      />
                    )}
                    {task.type === TaskType.MEDICATION && (
                      <MedicationTaskForm
                        medicationTask={{ ...task, ...task.MedicationTask[0] }}
                      />
                    )}
                    {task.type === TaskType.EXERCISE && (
                      <ExerciseTaskForm
                        exerciseTask={{ ...task, ...task.ExerciseTask[0] }}
                      />
                    )}
                    {task.type === TaskType.TREATMENT && (
                      <TreatmentTaskForm
                        treatmentTask={{ ...task, ...task.TreatmentTask[0] }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("delete")}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </>
            )}

            {task.type !== TaskType.MEDICATION && (
              <Button
                variant="outline"
                onClick={() => handleAction("complete")}
              >
                <CheckCircleIcon className="w-4 h-4" />
              </Button>
            )}

            <div className="flex flex-wrap gap-2">
              {task.TaskTag.map((tag: TaskTag) => (
                <div
                  key={tag.id}
                  className="flex items-center rounded-md px-2 py-1 text-sm font-medium"
                  style={getColor(tag.color)}
                >
                  <span className="mr-2">#{tag.value}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 w-5 h-5 flex items-center justify-center hover:bg-red-400"
                    onClick={() => onTagDelete(tag)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
              
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
