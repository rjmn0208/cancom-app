"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserForm from "@/components/UserForm";
import {
  User,
  Patient,
  Caretaker,
  Doctor,
  MedicalStaff,
  Address,
  UserType,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("User")
      .select(
        "*,Patient(*,CancerType(*)), Caretaker(*), Doctor(*), MedicalStaff(*,MedicalInstitution(*)), Address(*)"
      );
      
    if (!error) setUsers(data);
    
    console.log(data)
  };

  const handleUserDelete = async (user: User) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("User")
      .delete()
      .eq("id", user.id);

    fetchUsers();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Honorific</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.honorific}</TableCell>
              <TableCell>
                {user.firstName} {user.middleName} {user.lastName}
              </TableCell>
              <TableCell>{user.gender}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.userType}</Badge>
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
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      <UserForm userData={user} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUserDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                      </DialogHeader>
                      <div>
                        <h3 className="font-semibold">Basic Information</h3>
                        <p>Gender: {user.gender}</p>
                        <p>Phone: {user.phone}</p>
                        <p>
                          User Type:{" "}
                          <Badge variant="outline">{user.userType}</Badge>
                        </p>
                      </div>

                      {user.Address && user.Address[0] && (
                        <div>
                          <h3 className="font-semibold">Address</h3>
                          <p>{user.Address[0].addressLineOne}</p>
                          {user.Address[0].addressLineTwo && <p>{user.Address[0].addressLineTwo}</p>}
                          <p>
                            {user.Address[0].city}, {user.Address[0].province}{" "}
                            {user.Address[0].postalCode}
                          </p>
                          <p>{user.Address[0].country}</p>
                          <p>{user.Address[0].type}</p>
                        </div>
                      )}


                      {user.userType === UserType.PATIENT && (
                        <div>
                          <h3 className="font-semibold">Patient Information</h3>
                          <p>Cancer Type: {user.Patient.CancerType?.name}</p>
                          <p>Cancer Stage: {user.Patient.cancerStage}</p>
                          <p>
                            Diagnosis Date:{" "}
                            {new Date(
                              user.Patient.diagnosisDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {user.userType === UserType.CARETAKER && (
                        <div>
                          <h3 className="font-semibold">
                            Caretaker Information
                          </h3>
                          <p>Qualifications: {user.Caretaker.qualifications}</p>
                        </div>
                      )}

                      {user.userType === UserType.DOCTOR && (
                        <div>
                          <h3 className="font-semibold">Doctor Information</h3>
                          <p>License Number: {user.Doctor.licenseNumber}</p>
                        </div>
                      )}

                      {user.userType === UserType.MEDICAL_STAFF && (
                        <div>
                          <h3 className="font-semibold">
                            Medical Staff Information
                          </h3>
                          <p>Designation: {user.MedicalStaff.designation}</p>
                          <p>
                            Staff License Number:{" "}
                            {user.MedicalStaff.staffLicenseNumber}
                          </p>
                          <p>
                            Medical Institution:{" "}
                            {user.MedicalStaff.MedicalInstitution?.name}
                          </p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
