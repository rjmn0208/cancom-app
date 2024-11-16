'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/utils/supabase/client";
import { UserType } from "@/lib/types";

const formSchema = z.object({
  //user fields
  honorific: z.enum(['MR', 'MS', 'MRS', 'DR', 'PROF', 'REV']).nullable(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  userType: z.enum(['PATIENT', 'CARETAKER', 'DOCTOR', 'MEDICAL_STAFF']).nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable(),
  phone: z.string(),

  //patient fields
  cancerType: z.string(),
  cancerStage: z.enum(['STAGE_0', 'STAGE_I', 'STAGE_II', 'STAGE_III', 'STAGE_IV']),
  diagnosisDate: z.date(),

  //doctor fields
  licenseNumber: z.string(),

  //caretaker fields
  relationshipToPatient: z.enum(['FAMILY', 'FRIEND', 'COLLEAGUE', 'CARETAKER', 'OTHER', 'ACQUAINTANCE']),
  qualifications: z.string(),

  //medical staff fields
  medicalInstitutionId: z.number().nullable(),
  designation: z.string(),
  staffLicenseNumber: z.string()

})

type FormSchemaType = z.infer<typeof formSchema>;

const OnboardingPage = () => {
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

      cancerType: "",
      cancerStage: "STAGE_0",

      diagnosisDate: new Date(),
      licenseNumber: "",

      relationshipToPatient: "FAMILY",
      qualifications: "",
      
      medicalInstitutionId: null,
      designation: '',
      staffLicenseNumber: '',
    },
  });

  const handleSubmit = async (values: FormSchemaType) => {
    const supabase = createClient()
    const {data: {user}} = await supabase.auth.getUser()

    const {data: UserData, error: UserError} = await supabase
    .from('User')
    .insert([{
      id: user?.id,
      honorific: values.honorific,
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      userType: values.userType,
      gender: values.gender,
      phone: values.phone,
    }])

    if(UserError) throw new Error(UserError.message)
    
    if(values.userType === UserType.PATIENT) {
      const {data: PatientData, error: PatientError} = await supabase
      .from('Patient')
      .insert([{
        userId: user?.id,
        cancerType: values.cancerType,
        cancerStage: values.cancerStage,
        diagnosisDate: values.diagnosisDate
      }])

      if(PatientError) throw new Error(PatientError.message)
    }
    
    if(values.userType === UserType.CARETAKER) {
      const {data: CaretakerData, error: CaretakerDataError} = await supabase
      .from('Caretaker')
      .insert([{
        userId: user?.id,
        relationshipToPatient: values.relationshipToPatient,
        qualifications: values.qualifications
      }])

      if(CaretakerDataError) throw new Error(CaretakerDataError.message)
    }
    
    if(values.userType === UserType.DOCTOR) {
      const {data: DoctorData, error: DoctorError} = await supabase
      .from('Doctor')
      .insert([{
        userId: user?.id, 
        licenseNumber: values.licenseNumber
      }])

      if(DoctorError) throw new Error(DoctorError.message)

    }
    
    if(values.userType === UserType.MEDICAL_STAFF) {
      const {data: MedicalStaffData, error: MedicalStaffError} = await supabase
      .from('MedicalStaff')
      .insert([{
        userId: user?.id,
        medicalInstitutionId: values.medicalInstitutionId,
        designation: values.designation,
        staffLicenseNumber: values.staffLicenseNumber,
      }])
      
      if(MedicalStaffError) throw new Error(MedicalStaffError.message)
    }
  }

  
  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/2 bg-secondary flex flex-col items-center justify-center space-y-10">
        <img
          src="/images/cancomlogo.png"
          alt="Cancer Companion Logo"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-center">Welcome to Cancer Companion</h1>
      </div>

      <div className="w-1/2">
        <h1 className="text-3xl">Registration Page</h1>
        
      </div>
    </div>
  )
}

export default OnboardingPage
