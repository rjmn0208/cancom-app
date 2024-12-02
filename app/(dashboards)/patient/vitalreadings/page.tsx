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

import { Trash2 } from "lucide-react";
import { UserType, VitalReading } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const groupReadingsByPatientAndTimestamp = (readings: VitalReading[]) => {
  const grouped = readings.reduce((acc: any, reading: VitalReading) => {
    const key = `${reading.patientId}-${reading.timestamp}`;
    if (!acc[key]) {
      acc[key] = {
        patient: reading.Patient.User,
        timestamp: reading.timestamp,
        recordedBy: reading.RecordedBy,
        vitals: {},
        patientId: reading.patientId,
      };
    }
    acc[key].vitals[reading.Vitals.name] = reading.value;
    return acc;
  }, {});
  return Object.values(grouped);
};

const VitalsReadingPage = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const supabase = createClient();

  const fetchVitalReadings = async () => {
    const {data: {user}} = await supabase.auth.getUser()
    const {data: PatientData, error: PatientError} = await supabase
    .from('Patient')
    .select('id')
    .eq('userId', user?.id)
    .single()
    
    if(PatientError) throw new Error(PatientError.message)

    const { data, error } = await supabase
      .from("VitalReading")
      .select(
        `id,
        patientId,
        value,
        timestamp,
        Vitals(name),
        Patient(*, User(*)),
        RecordedBy: User!VitalsReading_recordedBy_fkey(*)`
      )
      .eq('patientId', PatientData.id)

    if (!error) {
      const groupedReadings = groupReadingsByPatientAndTimestamp(data || []);
      setReadings(groupedReadings);
    } else {
      console.error("Error fetching vital readings:", error);
    }
  };

  const handleDeleteGroup = async (patientId: number, timestamp: string) => {
    try {
      const { error } = await supabase
        .from("VitalReading")
        .delete()
        .match({ patientId, timestamp });

      if (error) {
        console.error("Error deleting vital readings:", error);
      } else {
        await fetchVitalReadings(); // Refresh table after deletion
      }
    } catch (error) {
      console.error("Unexpected error while deleting:", error);
    }
  };

  const handleAddSuccess = async () => {
    await fetchVitalReadings(); // Refresh the table data first
    setIsAddModalOpen(false); // Close modal only after successful data refresh
  };

  useEffect(() => {
    fetchVitalReadings();

    const subscription = supabase
      .channel("vital_readings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "VitalReading" },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchVitalReadings(); // Refresh data on realtime changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (!readings) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Vital Readings</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Vital Reading</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1100px] w-[1100px]">
            <VitalReadingForm userType={UserType.PATIENT} onSubmitSuccess={handleAddSuccess} />
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
          {readings.map((reading, index) => (
            <React.Fragment key={index}>
              <TableRow className="border-t-2 border-gray-300">
                <TableCell>
                  {reading.patient.firstName} {reading.patient.middleName || ""}{" "}
                  {reading.patient.lastName}
                </TableCell>
                <TableCell>
                  {reading.recordedBy.firstName} {reading.recordedBy.middleName || ""}{" "}
                  {reading.recordedBy.lastName}
                  <Badge>{reading.recordedBy.userType}</Badge>
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
                <TableCell>{reading.vitals["Heart Rate"] || "N/A"}</TableCell>
                <TableCell>{reading.vitals["Blood Pressure (Systolic)"] || "N/A"}</TableCell>
                <TableCell>{reading.vitals["Blood Pressure (Diastolic)"] || "N/A"}</TableCell>
                <TableCell>{reading.vitals["SP02 (Blood Oxygen Saturation)"] || "N/A"}</TableCell>
                <TableCell>{reading.vitals["Body Temperature"] || "N/A"}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteGroup(reading.patientId, reading.timestamp)}
                    className="p-2 border-gray-300 hover:bg-gray-100 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VitalsReadingPage;
