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

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentTask[]>([]);
  const [doctorId, setDoctorId] = useState<number>();

  const fetchDoctorId = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("Doctor")
      .select("id")
      .eq("userId", user?.id)
      .single();

    if (!error) setDoctorId(data.id);
  };
  const fetchAppointments = async () => {
    const supabase = createClient();

    const { data, error } = await supabase.from("AppointmentTask").select(`
    *,
    Task (
      TaskList (
        Patient (
          *,
          User (*)
        )
      )
    )
  `);

    if (!error) setAppointments(data);
  };

  useEffect(() => {
    fetchDoctorId()
    fetchAppointments();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Appointment Date</TableHead>
          <TableHead>Doctors Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((apt) => (
          <TableRow>
            <TableCell>{apt.id}</TableCell>
            <TableCell>
            {apt.Task.TaskList.Patient.User.firstName} {apt.Task.TaskList.Patient.User.middleName} {apt.Task.TaskList.Patient.User.lastName}
            </TableCell>
            <TableCell>
              {apt.appointmentDate.toString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DoctorAppointments;
