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
} from "@/components/ui/table"


const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentTask[]>([]);

  const fetchAppointments = async () => {
    const supabase = createClient();

    const { data, error } = await supabase.from("AppointmenTask").select("*");

    if (!error) setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DoctorAppointments;
