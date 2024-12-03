"use client";

import React, { useEffect, useState } from "react";
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
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";
import AddInstitutionForm from "@/components/AddInstitutionForm";

export interface Address {
  id: number;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  type: "PERMANENT" | "CURRENT" | null;
}

export interface MedicalInstitution {
  id: number;
  name: string;
  phone: string;
  addressId: number | null;
  address?: Address;
}

const MedicalInstitutionsPage = () => {
  const [institutions, setInstitutions] = useState<MedicalInstitution[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<MedicalInstitution | null>(null);

  const fetchInstitutions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("MedicalInstitution")
      .select("*, address:Address(*)");

    if (error) {
      toast.error("Failed to load medical institutions");
      return;
    }

    setInstitutions(data || []);
  };

  const handleAddOrUpdateInstitution = async (formData: Record<string, FormDataEntryValue>) => {
    const supabase = createClient();

    try {
      let addressId = null;

      if (selectedInstitution?.addressId) {
        // Update address
        const { error: addressError } = await supabase
          .from("Address")
          .update({
            addressLineOne: formData.addressLineOne,
            addressLineTwo: formData.addressLineTwo,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            country: formData.country,
            type: formData.type,
          })
          .eq("id", selectedInstitution.addressId);

        if (addressError) throw new Error("Failed to update address");

        addressId = selectedInstitution.addressId;
      } else {
        // Create new address
        const { data: addressData, error: addressError } = await supabase
          .from("Address")
          .insert({
            addressLineOne: formData.addressLineOne,
            addressLineTwo: formData.addressLineTwo,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            country: formData.country,
            type: formData.type,
          })
          .select("id")
          .single();

        if (addressError) throw new Error("Failed to create address");

        addressId = addressData.id;
      }

      if (selectedInstitution) {
        // Update institution
        const { error: institutionError } = await supabase
          .from("MedicalInstitution")
          .update({
            name: formData.name,
            phone: formData.phone,
            addressId,
          })
          .eq("id", selectedInstitution.id);

        if (institutionError) throw new Error("Failed to update institution");

        setInstitutions((prev) =>
          prev.map((inst) =>
            inst.id === selectedInstitution.id
              ? { ...inst, name: formData.name, phone: formData.phone, addressId }
              : inst
          )
        );

        toast.success("Medical institution updated successfully");
      } else {
        // Add new institution
        const { data: institutionData, error: institutionError } = await supabase
          .from("MedicalInstitution")
          .insert({
            name: formData.name,
            phone: formData.phone,
            addressId,
          })
          .select("*, address:Address(*)");

        if (institutionError) throw new Error("Failed to add medical institution");

        setInstitutions((prev) => [...prev, ...institutionData]);
        toast.success("Medical institution added successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }

    closeModal();
  };

  const handleDeleteInstitution = async (id: number) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.from("MedicalInstitution").delete().eq("id", id);

      if (error) throw new Error("Failed to delete institution");

      setInstitutions((prev) => prev.filter((inst) => inst.id !== id));
      toast.success("Medical institution deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const openAddModal = () => {
    setSelectedInstitution(null); // Clear selected institution for adding
    fetchInstitutions();
    setIsModalOpen(true);
  };

  const openEditModal = (institution: MedicalInstitution) => {
    setSelectedInstitution(institution); // Set the selected institution for editing
    fetchInstitutions();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchInstitutions();
    setSelectedInstitution(null); // Clear selected institution when modal closes
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Medical Institutions</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>Add Institution</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedInstitution ? "Edit Medical Institution" : "Add Medical Institution"}
              </DialogTitle>
            </DialogHeader>
            <AddInstitutionForm
              onSubmit={handleAddOrUpdateInstitution}
              onClose={closeModal}
              selectedInstitution={selectedInstitution}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>Manage Medical Institutions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.map((institution) => (
            <TableRow key={institution.id}>
              <TableCell>{institution.id}</TableCell>
              <TableCell>{institution.name}</TableCell>
              <TableCell>{institution.phone}</TableCell>
              <TableCell>{institution.address?.city || "No Address"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(institution)}
                    className="p-2 border rounded hover:bg-gray-100"
                    aria-label="Edit"
                  >
                    <Pencil className="w-5 h-5 text-black-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteInstitution(institution.id)}
                    className="p-2 border rounded hover:bg-gray-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MedicalInstitutionsPage;
