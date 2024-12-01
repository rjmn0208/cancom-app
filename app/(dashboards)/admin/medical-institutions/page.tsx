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
import { Pencil, Trash2 } from "lucide-react";
import InstitutionForm from "@/components/InstitutionForm";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleAddOrUpdate = async (formData: any) => {
    const supabase = createClient();
    let addressId = null;

    try {
      if (selectedInstitution?.addressId) {
        const { error } = await supabase
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

        if (error) throw new Error("Failed to update address");
        addressId = selectedInstitution.addressId;
      } else {
        const { data, error } = await supabase
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

        if (error) throw new Error("Failed to create address");
        addressId = data.id;
      }

      if (addressId) {
        if (selectedInstitution) {
          const { error } = await supabase
            .from("MedicalInstitution")
            .update({
              name: formData.name,
              phone: formData.phone,
              addressId: addressId,
            })
            .eq("id", selectedInstitution.id);

          if (error) throw new Error("Failed to update medical institution");

          setInstitutions((prev) =>
            prev.map((inst) =>
              inst.id === selectedInstitution.id
                ? { ...inst, name: formData.name, phone: formData.phone, addressId }
                : inst
            )
          );

          toast.success("Medical institution updated successfully");
        } else {
          const { data, error } = await supabase
            .from("MedicalInstitution")
            .insert({
              name: formData.name,
              phone: formData.phone,
              addressId: addressId,
            })
            .select("*, address:Address(*)");

          if (error) throw new Error("Failed to add medical institution");

          setInstitutions((prev) => [...prev, ...data]);
          toast.success("Medical institution added successfully");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }

    closeModals();
  };

  const handleDelete = async (institutionId: number) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("MedicalInstitution")
        .delete()
        .eq("id", institutionId);

      if (error) throw new Error("Failed to delete medical institution");

      setInstitutions((prev) => prev.filter((inst) => inst.id !== institutionId));
      toast.success("Medical institution deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const openEditModal = (institution: MedicalInstitution) => {
    setSelectedInstitution(institution);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedInstitution(null);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  if (!institutions) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Medical Institutions</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Institution</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Medical Institution</DialogTitle>
            </DialogHeader>
            <InstitutionForm
              onSubmit={(data) => handleAddOrUpdate(data)}
              onClose={closeModals}
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
                  {/* Edit Icon Button */}
                  <button
                    className="border border-gray-300 rounded p-2 hover:bg-gray-100"
                    onClick={() => openEditModal(institution)}
                    aria-label="Edit"
                  >
                    <Pencil className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Delete Icon Button */}
                  <button
                    className="border border-gray-300 rounded p-2 hover:bg-gray-100"
                    onClick={() => handleDelete(institution.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600" />
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
