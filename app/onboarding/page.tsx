"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { CancerType, MedicalInstitution, UserType } from "@/lib/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddressForm from "@/components/AddressForm";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  //user fields
  honorific: z.enum(["MR", "MS", "MRS", "DR", "PROF", "REV"]).nullable(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  userType: z
    .enum(["PATIENT", "CARETAKER", "DOCTOR", "MEDICAL_STAFF"])
    .nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  phone: z.string(),

  //patient fields
  cancerTypeId: z.number().nullable(),
  cancerStage: z.enum([
    "STAGE_0",
    "STAGE_I",
    "STAGE_II",
    "STAGE_III",
    "STAGE_IV",
  ]),
  diagnosisDate: z.date(),

  //doctor fields
  licenseNumber: z.string(),

  //caretaker fields
  qualifications: z.string(),

  //medical staff fields
  medicalInstitutionId: z.number().nullable(),
  designation: z.string(),
  staffLicenseNumber: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const refreshSession = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.refreshSession();
  if (error) {
    console.error("Error refreshing session:", error.message);
  }
};

const OnboardingPage = () => {
  const [cancerTypes, setCancerTypes] = useState<CancerType[]>([]);
  const [medicalInstitutions, setMedicalInstitutions] = useState<
    MedicalInstitution[]
  >([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentProgressBarValue, setCurrentProgressBarValue] =
    useState<number>(0);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      honorific: null,
      firstName: "",
      middleName: "",
      lastName: "",
      userType: null,
      gender: null,
      phone: "",

      //patient fields
      cancerTypeId: null,
      cancerStage: "STAGE_0",
      diagnosisDate: new Date(),

      //doctor fields
      licenseNumber: "",

      //caretaker field
      qualifications: "",

      //medstaff field
      medicalInstitutionId: null,
      designation: "",
      staffLicenseNumber: "",
    },
  });

  const router = useRouter();
  const userTypeState = form.watch("userType");

  const fetchCancerTypes = async () => {
    const supabase = createClient();

    const { data, error } = await supabase.from("CancerType").select("*");

    if (!error) setCancerTypes(data);
  };

  const fetchMedicalInstitutions = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("MedicalInstitution")
      .select("*, Address(*)");

    if (!error) setMedicalInstitutions(data);
  };

  const onSubmit = async (values: FormSchemaType) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: UserData, error: UserError } = await supabase
      .from("User")
      .insert([
        {
          id: user?.id,
          honorific: values.honorific,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          userType: values.userType,
          gender: values.gender,
          phone: values.phone,
        },
      ]);


    if (UserError) throw new Error(UserError.message);

    switch (values.userType) {
      case "PATIENT":
        const { error: patientError } = await supabase.from("Patient").insert({
          userId: user?.id,
          cancerTypeId: values.cancerTypeId,
          cancerStage: values.cancerStage,
          diagnosisDate: values.diagnosisDate,
        });
        if (patientError) throw patientError;
        break;

      case "CARETAKER":
        const { error: caretakerError } = await supabase
          .from("Caretaker")
          .insert({
            userId: user?.id,
            qualifications: values.qualifications,
          });
        if (caretakerError) throw caretakerError;
        break;

      case "DOCTOR":
        const { error: doctorError } = await supabase.from("Doctor").insert({
          userId: user?.id,
          licenseNumber: values.licenseNumber,
        });
        if (doctorError) throw doctorError;
        break;

      case "MEDICAL_STAFF":
        const { error: staffError } = await supabase
          .from("MedicalStaff")
          .insert({
            userId: user?.id,
            medicalInstitutionId: values.medicalInstitutionId,
            designation: values.designation,
            staffLicenseNumber: values.staffLicenseNumber,
          });
        if (staffError) throw staffError;
        break;
    }

    toast.success("User details saved successfully");
  };

  useEffect(() => {
    fetchCancerTypes();
    fetchMedicalInstitutions();
  }, []);

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 bg-secondary flex flex-col items-center justify-center space-y-10">
        <img src="/images/cancomlogo.png" alt="Cancer Companion Logo" />
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Welcome to Cancer Companion
        </h1>
      </div>

      <div className="w-full md:w-1/2 overflow-y-auto flex items-center justify-center">
        <Card className="w-4/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl m-4">Registration Page</CardTitle>
            <Progress value={currentProgressBarValue} />
          </CardHeader>
          <CardContent>
            {currentPage === 1 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => {
                  onSubmit(data)
                  setCurrentPage(2)
                  setCurrentProgressBarValue(50)
                })}>
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="honorific"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Honorifics: </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["MR", "MS", "MRS", "DR", "PROF", "REV"].map(
                                (value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name:</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name:</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name:</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender: </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["MALE", "FEMALE", "OTHER"].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number:</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Type: </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "PATIENT",
                              "CARETAKER",
                              "DOCTOR",
                              "MEDICAL_STAFF",
                            ].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6 border-t" />

                  {userTypeState === UserType.PATIENT && (
                    <>
                      <FormField
                        control={form.control}
                        name="cancerTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancer Type:</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value ? Number(value) : null)
                              }
                              defaultValue={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Cancer Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cancerTypes?.map((type: CancerType) => (
                                  <SelectItem
                                    key={type.id}
                                    value={type.id.toString()}
                                  >
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cancerStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancer Stage:</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "STAGE_0",
                                  "STAGE_I",
                                  "STAGE_II",
                                  "STAGE_III",
                                  "STAGE_IV",
                                ].map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diagnosisDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Diagnosis Date:</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                value={
                                  field.value
                                    ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {userTypeState === UserType.CARETAKER && (
                    <>
                      <FormField
                        control={form.control}
                        name="qualifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualifications:</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a little bit about yourself"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {userTypeState === UserType.DOCTOR && (
                    <>
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number:</FormLabel>
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {userTypeState === UserType.MEDICAL_STAFF && (
                    <>
                      <FormField
                        control={form.control}
                        name="medicalInstitutionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Institution:</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value ? Number(value) : null)
                              }
                              defaultValue={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Medical Institution" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medicalInstitutions?.map(
                                  (institution: MedicalInstitution) => (
                                    <SelectItem
                                      key={institution.id}
                                      value={institution.id.toString()}
                                    >
                                      <p className="font-bold">
                                        {institution.name}
                                      </p>
                                      <Separator className="color-white" />
                                      <p>
                                        {institution.Address.addressLineOne}
                                      </p>
                                      <p>
                                        {institution.Address.addressLineTwo}
                                      </p>
                                      <p>{institution.Address.city}</p>
                                      <p>{institution.Address.province}</p>
                                      <p>{institution.Address.country}</p>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation:</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Position in the hospital/clinic"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="staffLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number:</FormLabel>
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Button type="submit" className="w-full mt-4">
                    Register
                  </Button>
                </form>
              </Form>
            )}

            {currentPage === 2 && (
              <>
                <AddressForm />{" "}
                <Button
                  className="my-4"
                  onClick={() => {
                    refreshSession();
                    router.push(`/${userTypeState?.toLocaleLowerCase}`);
                    setCurrentProgressBarValue(100);
                  }}
                >
                  Finish
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
