"use client";

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VitalsForm from "@/components/VitalsForm";
import { CancerType, Specialization, Vitals } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CancerTypeForm from "@/components/CancerTypeForm";
import SpecializationForm from "@/components/SpecializationForm";

export default function ManageMedicalValues() {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [cancerTypes, setCancerTypes] = useState<CancerType[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([])

  const fetchVitals = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Vitals").select("*");
    if (!error) setVitals(data);
  };

  const fetchCancerTypes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("CancerType").select("*");
    if (!error) setCancerTypes(data);
  };
  const fetchSpecializations = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("Specialization").select("*");
    if (!error) setSpecializations(data);
  };

  const handleVitalsDelete = async (vital: Vitals) => {
    const supabase = createClient();
    await supabase.from("Vitals").delete().eq("id", vital.id);
    await fetchVitals();
  };

  const handleCancerTypeDelete = async (cancerType: CancerType) => {
    const supabase = createClient();
    await supabase.from("CancerType").delete().eq("id", cancerType.id);
    await fetchCancerTypes();
  };

  const handleSpecializationDelete = async (spt: Specialization) => {
    const supabase = createClient();
    await supabase.from("Specialization").delete().eq("id", spt.id);
    await fetchSpecializations();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      fetchVitals();
      fetchCancerTypes();
      fetchSpecializations();
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchCancerTypes();
    fetchSpecializations();
  }, []);

  return (
    <Tabs defaultValue="vitals" className="w-full">
      <TabsList>
        <TabsTrigger value="vitals">Vitals</TabsTrigger>
        <TabsTrigger value="cancerTypes">Cancer Types</TabsTrigger>
        <TabsTrigger value="specializations">Doctor Specializations</TabsTrigger>
      </TabsList>
      <TabsContent value="vitals">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vitals List</h2>
          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>Add Vital</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Vital Details</DialogTitle>
              </DialogHeader>
              <VitalsForm />
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Unit Of Measure</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitals.map((vital: Vitals) => (
                <TableRow key={vital.id}>
                  <TableCell>{vital.id}</TableCell>
                  <TableCell>{vital.name}</TableCell>
                  <TableCell>{vital.unitOfMeasure}</TableCell>
                  <TableCell>{vital.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Vital Details</DialogTitle>
                          </DialogHeader>
                          <VitalsForm vitals={vital} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleVitalsDelete(vital)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="cancerTypes">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Cancer Types List</h2>
          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>Add Cancer Type</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Cancer Type Details</DialogTitle>
              </DialogHeader>
              <CancerTypeForm />
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cancerTypes.map((cancerType: CancerType) => (
                <TableRow key={cancerType.id}>
                  <TableCell>{cancerType.id}</TableCell>
                  <TableCell>{cancerType.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Cancer Type Details</DialogTitle>
                          </DialogHeader>
                          <CancerTypeForm cancerType={cancerType} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCancerTypeDelete(cancerType)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="specializations">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Cancer Types List</h2>
          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>Add Specialization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Specialization Details</DialogTitle>
              </DialogHeader>
              <SpecializationForm />
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specializations?.map((spt: Specialization) => (
                <TableRow key={spt.id}>
                  <TableCell>{spt.id}</TableCell>
                  <TableCell>{spt.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Specialization Details</DialogTitle>
                          </DialogHeader>
                          <SpecializationForm specialization={spt} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSpecializationDelete(spt)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
