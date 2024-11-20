"use client";

import { useState, useEffect } from "react";
import { Clock, Pill, Stethoscope, User, BookOpen, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListPermission, Task, TaskType } from "@/lib/types";
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
  const [permission, setPermission] = useState<ListPermission>();

  const taskListId = Number(params.id);

  const fetchPermission = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ListMembership")
      .select("permission")
      .eq("userId", user?.id)
      .eq("taskListId", taskListId)
      .single();

    if (!error) setPermission(data.permission);
  };

  const fetchTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*),ExerciseTask(*), MedicationTask(*), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))",
      )
      .eq("taskListId", taskListId)
      .eq("isDone", false)
      .eq("isArchived", false);

    if (!error && data) setTasks(data);
  };

  const fetchCompletedTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*), ExerciseTask(*), MedicationTask(*), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))",
      )
      .eq("taskListId", taskListId)
      .eq("isDone", true)
      .eq("isArchived", false);

    if (!error && data) setCompletedTasks(data);
  };

  const fetchArchivedTasks = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("Task")
      .select(
        "*, TaskTag(*), TaskCreator: User(*), ExerciseTask (*), MedicationTask(*), AppointmentTask(*, Doctor(*, User(*))), TreatmentTask(*, MedicalInstitution(*, Address(*)))",
      )
      .eq("taskListId", taskListId)
      .eq("isArchived", true)
      .eq("isDone", false)
      .eq("taskCreator", user?.id);

    if (!error && data) setArchivedTasks(data);
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
      fetchCompletedTasks();
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

  const isListManager = () => {
    return permission === ListPermission.MANAGER;
  };

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
    fetchArchivedTasks();
    fetchPermission();
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
          {isListManager() && (
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
          )}

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
                  isCompleted={true}
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
                  onOpenChange={handleOpenChange}
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
        {isListManager() && (
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-[calc(100vh-120px)]">
        {Object.values(TaskType).map((type) => (
          <div key={type} className="space-y-4">
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
