"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  UserCircle,
  Users,
  Calendar,
  MapPin,
  Stethoscope,
  HeartPulse,
  UserPlus,
} from "lucide-react";
import {
  Gender,
  Honorifics,
  UserType,
  CancerStage,
  Relationship,
  User,
  Patient,
  Doctor,
  Caretaker,
  Address,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserForm from "@/components/UserForm";
import AddressForm from "@/components/AddressForm";
import PatientForm from "@/components/PatientForm";

interface ProfileData {
  user: User;
  patient?: Patient;
  doctor?: Doctor;
  caretaker?: Caretaker;
  address?: Address;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const fetchProfileData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }

    let patientData, doctorData, caretakerData, addressData;

    if (userData.userType === "PATIENT") {
      const { data: patient } = await supabase
        .from("Patient")
        .select("*")
        .eq("userId", user.id)
        .single();
      patientData = patient;
    } else if (userData.userType === "DOCTOR") {
      const { data: doctor } = await supabase
        .from("Doctor")
        .select("*")
        .eq("userId", user.id)
        .single();
      doctorData = doctor;
    } else if (userData.userType === "CARETAKER") {
      const { data: caretaker } = await supabase
        .from("Caretaker")
        .select("*")
        .eq("userId", user.id)
        .single();
      caretakerData = caretaker;
    }

    const { data: address } = await supabase
      .from("Address")
      .select("*")
      .eq("userId", user.id)
      .single();

    setProfileData({
      user: userData,
      patient: patientData,
      doctor: doctorData,
      caretaker: caretakerData,
      address: address,
    });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (!profileData) return <div>Loading...</div>;

  const { user, patient, doctor, caretaker, address } = profileData;
  const fullName = `${user.honorific} ${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src="/placeholder.svg?height=96&width=96"
              alt={`${user.firstName}'s avatar`}
            />
            <AvatarFallback>
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-grow">
            <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {user.userType}
            </Badge>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input User Details</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="user">
                <TabsList>
                  <TabsTrigger value="user">User Information</TabsTrigger>
                  <TabsTrigger value="role">
                    Role Specific Information
                  </TabsTrigger>
                  <TabsTrigger value="address">Address Information</TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                  <UserForm userData={profileData.user} />
                </TabsContent>

                <TabsContent value="role">
                  <PatientForm patient={profileData.patient} />
                </TabsContent>

                <TabsContent value="address">
                  <AddressForm address={profileData.address} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="role">Role-Specific Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      First Name
                    </div>
                    <div>{user.firstName}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </div>
                    <div>{user.lastName}</div>
                  </div>
                  {user.middleName && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Middle Name
                      </div>
                      <div>{user.middleName}</div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Gender
                    </div>
                    <div>{user.gender}</div>
                  </div>
                </div>
                <div className="pt-4 space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <UserCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{user.gender}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{user.userType}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="role">
              {patient && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Cancer Type
                      </div>
                      <div>{patient.cancerType}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Cancer Stage
                      </div>
                      <div>{patient.cancerStage}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Diagnosis Date
                      </div>
                      <div>
                        {new Date(patient.diagnosisDate).toLocaleString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {doctor && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Doctor Information</h3>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      License Number
                    </div>
                    <div>{doctor.licenseNumber}</div>
                  </div>
                </div>
              )}
              {caretaker && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Caretaker Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Qualifications
                      </div>
                      <div>{caretaker.qualifications}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="address">
              {address && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Address Line 1
                      </div>
                      <div>{address.addressLineOne}</div>
                    </div>
                    {address.addressLineTwo && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Address Line 2
                        </div>
                        <div>{address.addressLineTwo}</div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        City
                      </div>
                      <div>{address.city}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Province
                      </div>
                      <div>{address.province}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Postal Code
                      </div>
                      <div>{address.postalCode}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Country
                      </div>
                      <div>{address.country}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Address Type
                      </div>
                      <Badge variant={"secondary"}>{address.type}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
