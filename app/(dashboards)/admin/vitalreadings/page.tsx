"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import { UserType, VitalReading, Vitals } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@mui/material";
import VitalsForm from "@/components/VitalsForm";
import VitalReadingForm from "@/components/VitalReadingForm";
import { Badge } from "@/components/ui/badge";

export default function VitalsManagement() {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [vitalReadings, setVitalReadings] = useState<VitalReading[]>([]);

  const fetchVitals = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Vitals").select("*");

    if (!error) setVitals(data);
  };

  const fetchVitalReadings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("VitalReading").select(`
        *, 
        Vitals(*),
        Patient(*, 
          User(*)),
        RecordedBy: User!VitalsReading_recordedBy_fkey(*),
        LastEditedBy: User!VitalReading_lastEditedBy_fkey(*)
      `);

    console.log(data, error);

    if (!error) setVitalReadings(data);
  };

  const handleVitalsDelete = async (vital: Vitals) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Vitals")
      .delete()
      .eq("id", vital.id);

    await fetchVitals();
  };

  const handleVitalReadingsDelete = async (vitalReading: VitalReading) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("VitalReading")
      .delete()
      .eq("id", vitalReading.id);

    await fetchVitalReadings();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      fetchVitals();
      fetchVitalReadings();
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchVitalReadings();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vital Readings</h2>
          <Dialog onOpenChange={(open) => handleOpenChange(open)}>
            <DialogTrigger asChild>
              <Button>Add Vital Reading</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Vital Reading Details</DialogTitle>
              </DialogHeader>
              <VitalReadingForm userType={UserType.ADMIN}/>
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vital</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Last Edited By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitalReadings.map((reading: VitalReading) => (
                <TableRow key={reading.id}>
                  <TableCell>{reading.id}</TableCell>
                  <TableCell>{reading.Vitals.name}</TableCell>
                  <TableCell>
                    {reading.Patient.User.firstName}{" "}
                    {reading.Patient.User.middleName}{" "}
                    {reading.Patient.User.lastName}
                  </TableCell>
                  <TableCell>{reading.value}</TableCell>
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
                    <div>
                      {reading.RecordedBy.firstName}{" "}
                      {reading.RecordedBy.middleName}{" "}
                      {reading.RecordedBy.lastName}
                    </div>
                    <Badge>{reading.RecordedBy.userType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      {reading.LastEditedBy.firstName}{" "}
                      {reading.LastEditedBy.middleName}{" "}
                      {reading.LastEditedBy.lastName}
                    </div>
                    <Badge>{reading.LastEditedBy.userType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog onOpenChange={(open) => handleOpenChange(open)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Input Vital Details</DialogTitle>
                          </DialogHeader>
                          <VitalReadingForm userType={UserType.ADMIN}/>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleVitalReadingsDelete(reading)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
