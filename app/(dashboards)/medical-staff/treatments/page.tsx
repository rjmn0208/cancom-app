"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MedStaffTreatmemtForm from "@/components/MedStaffTreatmentForm";
import { TreatmentTask } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  CircleCheckBig,
  EditIcon,
  Search,
  Trash2Icon,
  Undo,
} from "lucide-react";
import { toast } from "sonner";
import MedStaffTreatmentForm from "@/components/MedStaffTreatmentForm";

const TreatmentPage = () => {
  const [treatmentTasks, setTreatmentTasks] = useState<TreatmentTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const searchTask = (treatment: TreatmentTask, query: string) => {
    const searchFields = [
      
      treatment.Task.title,
      treatment.treatmentType,

      treatment.Task.TaskList.Patient.User.firstName,
      treatment.Task.TaskList.Patient.User.middleName,
      treatment.Task.TaskList.Patient.User.lastName,
      
    ];

    return searchFields.some(
      (field) => field && field.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredTreatments = treatmentTasks.filter((treatment) =>
    searchTask(treatment, searchQuery)
  );

  const fetchTreatmentTasks = async () => {
    const supabase = createClient();

    //* Get the current user*
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not found");

    //* Get medical institution ID of the medical staff*
    const { data: medStaffData, error: medStaffError } = await supabase
      .from("MedicalStaff")
      .select("medicalInstitutionId")
      .eq("userId", user.id)
      .single();

    if (medStaffError) throw new Error(medStaffError.message);

    //* Fetch treatment tasks associated with the medical institution*
    const { data: treatmentTaskData, error: treatmentTaskError } =
      await supabase
        .from("TreatmentTask")
        .select(
          `
        *,
        Task(
          *,
          TaskList(
            *,
            Patient(*, User(*))
          )
        )
      `
        )
        .eq("medicalInstitutionId", medStaffData.medicalInstitutionId);

    console.log(treatmentTaskData);
    if (treatmentTaskError) throw new Error(treatmentTaskError.message);

    //* Set the treatment tasks*
    setTreatmentTasks(treatmentTaskData);
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) fetchTreatmentTasks();
  };

  const handleDelete = async (treatment: TreatmentTask) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("TreatmentTask")
      .delete()
      .eq("id", treatment.id);

    if (!error) toast.success("Treatment deleted successfully");
  };

  const handleMarkComplete = async (treatment: TreatmentTask) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .update({ isDone: true, finishDate: new Date() })
      .eq("id", treatment.taskId);

    console.log(error);

    if (!error) toast.success("Treatment completed");
    fetchTreatmentTasks();
  };

  const handleUndoComplete = async (treatment: TreatmentTask) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .update({ isDone: false, finishDate: null })
      .eq("id", treatment.taskId);

    console.log(error);

    if (!error) toast.success("Treatment set to pending");
    fetchTreatmentTasks();
  };

  useEffect(() => {
    fetchTreatmentTasks();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="flex items-center gap-4 m-5">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search treatments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-4/5"
        />
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant='outline'>Add Treatment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                <MedStaffTreatmemtForm />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of recent treatments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Treatment Type</TableHead>
            <TableHead>Treatment Date</TableHead>
            <TableHead>Dosage (Units)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTreatments.map((treatment) => (
            <TableRow key={treatment.id}>
              <TableCell>{treatment.id}</TableCell>
              <TableCell>{treatment.Task.title}</TableCell>

              <TableCell>
                {treatment.Task.TaskList?.Patient?.User.firstName}{" "}
                {treatment.Task.TaskList?.Patient?.User.middleName}{" "}
                {treatment.Task.TaskList?.Patient?.User.lastName}
              </TableCell>
              <TableCell>
                <Badge
                  variant={treatment.Task.isDone ? "default" : "secondary"}
                >
                  {treatment.Task.isDone ? "Completed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>{treatment.treatmentType}</TableCell>
              <TableCell>
                {new Date(treatment.date).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </TableCell>
              <TableCell>{treatment.dosage} Units</TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Dialog onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Input Treatment Details</DialogTitle>
                        <DialogDescription>
                          <MedStaffTreatmentForm treatment={treatment}/>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleMarkComplete(treatment)}
                  >
                    <CircleCheckBig className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleUndoComplete(treatment)}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(treatment)}
                  >
                    <Trash2Icon className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TreatmentPage;
