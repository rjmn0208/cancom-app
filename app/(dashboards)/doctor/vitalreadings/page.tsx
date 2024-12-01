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

import { UserType, VitalReading } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const VitalsReadingPage = () => {
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage the "Add" modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to manage the "Edit" modal
  const [selectedReading, setSelectedReading] = useState<VitalReading | null>(null); // Selected reading for editing

  const fetchVitalReadings = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("VitalReading")
      .select(
        `*,
        Vitals(*),
        Patient(*, 
          User(*)),
        RecordedBy: User!VitalsReading_recordedBy_fkey(*),
        LastEditedBy: User!VitalReading_lastEditedBy_fkey(*)
      `
      )
      .eq("recordedBy", user?.id);

    if (!error) setReadings(data || []);
  };

  const handleDelete = async (vitalReading: VitalReading) => {
    const supabase = createClient();
    await supabase.from("VitalReading").delete().eq("id", vitalReading.id);
    await fetchVitalReadings();
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    fetchVitalReadings(); // Ensure the table refreshes after adding a record
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedReading(null); // Clear selected reading
    fetchVitalReadings(); // Ensure the table refreshes after editing a record
  };

  const openEditModal = (reading: VitalReading) => {
    setSelectedReading(reading);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchVitalReadings();
  }, []);

  if (!readings) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Vital Readings</h2>
        {/* Add Vital Reading */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Vital Reading</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1100px] w-[1100px]">
            <DialogHeader>
              <DialogTitle>Input Vital Reading Details</DialogTitle>
            </DialogHeader>
            <VitalReadingForm userType={UserType.DOCTOR} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of your recent vital readings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Recorded For (Patient)</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Heart Rate</TableHead>
            <TableHead>Systolic BP</TableHead>
            <TableHead>Diastolic BP</TableHead>
            <TableHead>SPO2</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading: VitalReading) => (
            <TableRow key={reading.id}>
              {/* Recorded For (Patient) */}
              <TableCell>
                {reading.Patient.User.firstName} {reading.Patient.User.middleName || ""}{" "}
                {reading.Patient.User.lastName}
              </TableCell>
              {/* Recorded By */}
              <TableCell>
                <p>
                  {reading.RecordedBy.firstName} {reading.RecordedBy.middleName || ""}{" "}
                  {reading.RecordedBy.lastName}
                </p>
                <Badge>{reading.RecordedBy.userType}</Badge>
              </TableCell>
              {/* Created At */}
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
              {/* Heart Rate */}
              <TableCell>{reading.Vitals?.name === 'Heart Rate' || "N/A"}</TableCell>
              {/* Systolic BP */}
              <TableCell>{reading.Vitals?.name === 'Blood Pressure (Systolic)' || "N/A"}</TableCell>
              {/* Diastolic BP */}
              <TableCell>{reading.Vitals?.name === 'Blood Pressure (Diastolic)' || "N/A"}</TableCell>
              {/* SPO2 */}
              <TableCell>{reading.Vitals?.name === 'SP02 (Blood Oxygen Saturation)' || "N/A"}</TableCell>
              {/* Temperature */}
              <TableCell>{reading.Vitals?.name === 'Body Temperature' || "N/A"}</TableCell>
              {/* Actions */}
              <TableCell>
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant={"outline"} onClick={() => openEditModal(reading)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[426px]">
                    <DialogHeader>
                      <DialogTitle>Edit Vital Reading</DialogTitle>
                    </DialogHeader>
                    {selectedReading && (
                      <VitalReadingForm
                        vitalReading={selectedReading}
                        onClose={handleEditModalClose}
                      />
                    )}
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
