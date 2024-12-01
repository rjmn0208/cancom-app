"use client";

import { AppointmentTask } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DoctorNotesForm from "@/components/DoctorNotesForm";
import { CircleCheckBig, Info, Search, Undo } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const searchTask = (appointment: AppointmentTask, query: string) => {
    const searchFields = [
      appointment.Task.TaskList.Patient.User.firstName,
      appointment.Task.TaskList.Patient.User.middleName,
      appointment.Task.TaskList.Patient.User.lastName,
      appointment.Doctor?.User?.firstName,
      appointment.Doctor?.User?.middleName,
      appointment.Doctor?.User?.lastName,

      appointment.purpose,
      appointment.doctorsNotes,
    ];

    return searchFields.some(
      (field) => field && field.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredAppointments = appointments.filter((appointment) =>
    searchTask(appointment, searchQuery)
  );

  const fetchAppointments = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: DoctorData, error: DoctorError } = await supabase
      .from("Doctor")
      .select("id")
      .eq("userId", user?.id)
      .single();

    if (DoctorError) throw new Error(DoctorError.message);

    const { data: AppointmentData, error: AppointmentError } = await supabase
      .from("AppointmentTask")
      .select(
        `
      *,
      Task (
        *,
        TaskList (
          Patient (
            *,
            User (*),
            CancerType (name)
          )
        )
      )
    `
      )
      .eq("doctorId", DoctorData.id);

    if (!AppointmentError) setAppointments(AppointmentData);
  };

  const handleMarkComplete = async (apt: AppointmentTask) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .update({ isDone: true, finishDate: new Date() })
      .eq("id", apt.taskId);

    console.log(error);

    if (!error) toast.success("Appointment completed");
    fetchAppointments();
  };

  const handleUndoComplete = async (apt: AppointmentTask) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("Task")
      .update({ isDone: false, finishDate: null })
      .eq("id", apt.taskId);

    console.log(error);

    if (!error) toast.success("Appointment completed");
    fetchAppointments();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) fetchAppointments();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="flex items-center gap-4 m-5">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-4/5"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Appointment Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Doctors Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.map((apt) => (
            <TableRow>
              <TableCell>{apt.id}</TableCell>
              <TableCell>
                <div className="flex items-center justify-between">
                  <span>
                    {apt.Task.TaskList.Patient.User.firstName}{" "}
                    {apt.Task.TaskList.Patient.User.middleName}{" "}
                    {apt.Task.TaskList.Patient.User.lastName}
                  </span>

                  <Dialog onOpenChange={handleOpenChange}>
                    <DialogTrigger>
                      <Button variant="outline" size="icon">
                        <Info className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Patient Information</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            Full Name
                          </h3>
                          <p className="text-gray-400">
                            {apt.Task.TaskList.Patient.User.honorific}{" "}
                            {apt.Task.TaskList.Patient.User.firstName}{" "}
                            {apt.Task.TaskList.Patient.User.middleName}{" "}
                            {apt.Task.TaskList.Patient.User.lastName}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            Phone Number
                          </h3>
                          <p className="text-gray-400">
                            {apt.Task.TaskList.Patient.User.phone}
                          </p>
                        </div>

                        <div className="flex gap-8">
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              Cancer Type
                            </h3>
                            <p className="text-gray-400">
                              {apt.Task.TaskList.Patient.CancerType.name}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              Cancer Stage
                            </h3>
                            <p className="text-gray-400">
                              {apt.Task.TaskList.Patient.cancerStage}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            Diagnosis Date
                          </h3>
                          <p className="text-gray-400">
                            {new Date(
                              apt.Task.TaskList.Patient.diagnosisDate
                            ).toLocaleString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>

              <TableCell>
                {new Date(apt.appointmentDate).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </TableCell>
              <TableCell>
                <Badge variant={apt.Task.isDone ? "default" : "secondary"}>
                  {apt.Task.isDone ? "Completed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>{apt.purpose}</TableCell>
              <TableCell className="max-w-[100px]">
                {apt.doctorsNotes}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Dialog onOpenChange={handleOpenChange}>
                    <DialogTrigger>
                      <Button variant="outline">Add Notes</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Add notes regarding the appointment
                        </DialogTitle>
                      </DialogHeader>
                      <DoctorNotesForm appointmentTask={apt} />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleMarkComplete(apt)}
                  >
                    <CircleCheckBig className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleUndoComplete(apt)}
                  >
                    <Undo className="w-4 h-4" />
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

export default DoctorAppointments;
