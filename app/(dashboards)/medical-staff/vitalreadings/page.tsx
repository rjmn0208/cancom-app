"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VitalReadingForm from "@/components/VitalReadingForm";

import { VitalReading } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const VitalsReadingPage = () => {
  const [readings, setReadings] = useState<VitalReading[]>();

  const fetchVitalReadings = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("VitalReading")
      .select(
        `
      *, 
      Vitals(*),
      Patient(*, 
        User(*)),
      RecordedBy: User!VitalsReading_recordedBy_fkey(*),
      LastEditedBy: User!VitalReading_lastEditedBy_fkey(*)
    `,
      )
      .eq("recordedBy", user?.id);

    console.log(data, error);

    if (!error) setReadings(data);
  };

  const handleDelete = async (vitalReading: VitalReading) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("VitalReading")
      .delete()
      .eq("id", vitalReading.id);

    await fetchVitalReadings();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) fetchVitalReadings();
  };

  useEffect(() => {
    fetchVitalReadings();
  }, []);

  if (!readings) return <div>Loading....</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Vital Readings</h2>
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Add Vital Reading</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] w-[900px]">
            <DialogHeader>
              <DialogTitle>Input Vital Reading Details</DialogTitle>
            </DialogHeader>
            <VitalReadingForm />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of your recent vital readings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Recorded For (Patient)</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead>Vital</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Edited By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading: VitalReading) => (
            <TableRow>
              <TableCell>{reading.id}</TableCell>
              <TableCell>
                {reading.Patient.User.firstName}{" "}
                {reading.Patient.User.middleName}{" "}
                {reading.Patient.User.lastName}
              </TableCell>
              <TableCell>
                <p>
                  {reading.RecordedBy.firstName} {reading.RecordedBy.middleName}{" "}
                  {reading.RecordedBy.lastName}
                </p>
                <Badge>{reading.RecordedBy.userType}</Badge>
              </TableCell>
              <TableCell>{reading.Vitals.name}</TableCell>
              <TableCell>
                {reading.value} {reading.Vitals.unitOfMeasure}
              </TableCell>
              <TableCell>
                {new Date(reading.timestamp).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </TableCell>
              <TableCell>
                {reading.LastEditedBy.firstName}{" "}
                {reading.LastEditedBy.middleName}{" "}
                {reading.LastEditedBy.lastName}
              </TableCell>
              <TableCell>
                <Dialog onOpenChange={handleOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Input Vital Reading Details</DialogTitle>
                    </DialogHeader>
                    <VitalReadingForm vitalReading={reading} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant={"destructive"}
                  className="mt-2"
                  onClick={() => handleDelete(reading)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VitalsReadingPage;
