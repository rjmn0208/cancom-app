"use client";

import { useState, useEffect } from "react";
import { Clock, Pill, Stethoscope, User, BookOpen, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicationTaskSchedule, Task, TaskTag, TaskType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TaskCard from "@/components/TaskCard";
import ListMemberForm from "@/components/ListMemberForm";
import ListMembershipTable from "@/components/ListMembershipTable";
import MedicationTaskForm from "@/components/MedicationTaskForm";
import { Label } from "@/components/ui/label";
import GeneralTaskForm from "@/components/GeneralTaskForm";
import AppointmentTaskForm from "@/components/AppointmentTaskForm";
import { Separator } from "@/components/ui/separator";
import TreatmentTaskForm from "@/components/TreatmentTaskForm";
import ExerciseTaskForm from "@/components/ExerciseTaskForm";

const PatientTaskListPage = ({ params }: { params: { id: string } }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [addTaskType, setAddTaskType] = useState<TaskType>();

  const taskListId = Number(params.id);

  const fetchTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*),ExerciseTask(*), MedicationTask(*,MedicationTaskSchedule(*)), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))"
      )
      .eq("taskListId", taskListId)
      .eq("isDone", false);

    console.log("Tasks:", data, "Error:", error);
    if (!error && data) setTasks(data);
  };

  const fetchCompletedTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*), ExerciseTask(*), MedicationTask(*,MedicationTaskSchedule(*)), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))"
      )
      .eq("taskListId", taskListId)
      .eq("isDone", true);

    if (!error && data) setCompletedTasks(data);
  };

  const fetchArchivedTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*), ExerciseTask (*), MedicationTask(*,MedicationTaskSchedule(*)), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))"
      )
      .eq("taskListId", taskListId)
      .eq("isArchived", true)
      .eq("isDone", false);

    if (!error && data) setArchivedTasks(data);
  };

  const handleTaskTagDelete = async (tag: TaskTag) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("TaskTag")
      .delete()
      .eq("id", tag.id);

    if (!error) {
      toast.success("Tag deleted successfully");
      fetchTasks();
      fetchCompletedTasks();
      fetchArchivedTasks();
    }
  };

  const handleDelete = async (task: Task) => {
    const supabase = createClient();
    const { error } = await supabase.from("Task").delete().eq("id", task.id);

    if (!error) {
      toast.success("Task deleted successfully");
      fetchTasks();
      fetchCompletedTasks();
    }
  };

  const handleComplete = async (task: Task) => {
    const supabase = createClient();

    // Step 1: Check if the task has a prerequisite task and if it is completed
    if (task.prerequisiteTaskId) {
      const { data: prerequisiteTask, error: prerequisiteError } =
        await supabase
          .from("Task")
          .select("id, isDone")
          .eq("id", task.prerequisiteTaskId)
          .single();

      if (prerequisiteError) {
        toast.error("Error fetching prerequisite task");
        return;
      }

      if (!prerequisiteTask?.isDone) {
        toast.error(
          `Please complete the prerequisite task before completing ${task.title}`
        );
        return;
      }
    }

    // Step 2: Check if the task has subtasks and mark them as complete
    const { data: subtasks, error: subtaskError } = await supabase
      .from("Task")
      .select("id")
      .eq("parentTaskId", task.id); // Assuming 'parentTaskId' is used to link subtasks

    if (subtaskError) {
      toast.error("Error fetching subtasks");
      return;
    }

    if (subtasks && subtasks.length > 0) {
      // Mark all subtasks as complete
      const { error: updateSubtasksError } = await supabase
        .from("Task")
        .update({ isDone: true, finishDate: new Date() })
        .in(
          "id",
          subtasks.map((subtask) => subtask.id)
        );

      if (updateSubtasksError) {
        toast.error("Error completing subtasks");
        return;
      }
    }

    // Step 3: Mark the current task as complete
    const { error } = await supabase
      .from("Task")
      .update({
        isDone: true,
        finishDate: new Date(),
      })
      .eq("id", task.id);

    if (!error) {
      toast.success("Task marked complete");
      fetchTasks();
      fetchArchivedTasks();
      fetchCompletedTasks();
    } else {
      toast.error("Error completing task");
    }
  };

  const handleUndoComplete = async (task: Task) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("Task")
      .update({
        isDone: false,
        finishDate: null,
      })
      .eq("id", task.id);

    if (!error) {
      toast.success("Task undoed");
      fetchTasks();
      fetchCompletedTasks();
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      fetchTasks();
      fetchCompletedTasks();
      fetchArchivedTasks();
    }
  };

  const handleMedTaskScheduleMarkTaken= async (sched: MedicationTaskSchedule) => {
    const supabase = createClient()

    const {data, error} = await supabase
    .from('MedicationTaskSchedule')
    .update({
      isTaken: true
    })
    .eq('id', sched.id)
    .select()
    .single()

    if(!error) {
      toast.success(`Medicine Taken at ${data.time}`)
      fetchTasks();
      fetchArchivedTasks();
      fetchCompletedTasks();
    }
  }

  const handleMedTaskScheduleTakenDelete = async (sched: MedicationTaskSchedule) => {
    const supabase = createClient()

    const {data, error} = await supabase
    .from('MedicationTaskSchedule')
    .delete()
    .eq('id', sched.id)
    .single()
    
    if(!error) {
      toast.success('Schedule delete successful')
      fetchTasks();
      fetchArchivedTasks();
      fetchCompletedTasks();
    }
  }

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
    fetchArchivedTasks();
  }, []);

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "MEDICATION":
        return <Pill className="h-4 w-4" />;
      case "APPOINTMENT":
        return <Stethoscope className="h-4 w-4" />;
      case "JOURNAL":
        return <BookOpen className="h-4 w-4" />;
      case "TREATMENT":
        return <Cross className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent className="h-4/5 overflow-y-auto w-11/12">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Choose a task type and fill in the details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <Label>Choose Task Type</Label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {Object.values(TaskType).map((type) => (
                      <Button
                        key={type}
                        variant={addTaskType === type ? "default" : "outline"}
                        onClick={() => setAddTaskType(type)}
                        className="w-full"
                      >
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                {addTaskType === TaskType.GENERAL && (
                  <GeneralTaskForm taskListId={taskListId} />
                )}
                {addTaskType === TaskType.APPOINTMENT && (
                  <AppointmentTaskForm taskListId={taskListId} />
                )}
                {addTaskType === TaskType.MEDICATION && (
                  <MedicationTaskForm taskListId={taskListId} />
                )}
                {addTaskType === TaskType.TREATMENT && (
                  <TreatmentTaskForm taskListId={taskListId} />
                )}
                {addTaskType === TaskType.EXERCISE && (
                  <ExerciseTaskForm taskListId={taskListId} />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Sheet onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline">View Completed Tasks</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>List of Completed Tasks</SheetTitle>
              </SheetHeader>
              {completedTasks.map((cTask) => (
                <TaskCard
                  key={cTask.id}
                  task={cTask}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onUndoComplete={handleUndoComplete}
                  onOpenChange={handleOpenChange}
                  onTagDelete={handleTaskTagDelete}
                  isCompleted={true}
                  onMedScheduleMarkTaken={handleMedTaskScheduleMarkTaken}
                  onMedScheduleDelete={handleMedTaskScheduleTakenDelete}
                />
              ))}
            </SheetContent>
          </Sheet>

          <Sheet onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline">View Archived Tasks</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>List of Archived Tasks</SheetTitle>
              </SheetHeader>
              {archivedTasks.map((archTask) => (
                <TaskCard
                  key={archTask.id}
                  task={archTask}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onUndoComplete={handleUndoComplete}
                  onTagDelete={handleTaskTagDelete}
                  onOpenChange={handleOpenChange}
                  onMedScheduleMarkTaken={handleMedTaskScheduleMarkTaken}
                  onMedScheduleDelete={handleMedTaskScheduleTakenDelete}
                />
              ))}
            </SheetContent>
          </Sheet>
          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                View Members
              </Button>
            </DialogTrigger>
            <DialogContent className=" lg:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Manage User Permissions</DialogTitle>
              </DialogHeader>
              <div className="p-4 max-h-[90vh] overflow-y-auto">
                <ListMembershipTable taskListId={taskListId} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Invite to Task List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User Permissions</DialogTitle>
            </DialogHeader>
            <div className="p-4 max-h-[90vh] overflow-y-auto">
              <ListMemberForm taskListId={taskListId} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-6 overflow-x-auto">
        
        {Object.values(TaskType).map((type) => (
          <div key={type} className="w-[600px]">
            <div className="flex items-center space-x-2">
              {getTaskIcon(type)}
              <h2 className="font-semibold text-lg">{type}</h2>
            </div>
            <div className="space-y-4">
              {tasks
                .filter((task) => task.type === type)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                    onOpenChange={handleOpenChange}
                    onTagDelete={handleTaskTagDelete}
                    onMedScheduleMarkTaken={handleMedTaskScheduleMarkTaken}
                    onMedScheduleDelete={handleMedTaskScheduleTakenDelete}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientTaskListPage;
