'use client'

import { useState } from "react"
import AddressForm from "@/components/AddressForm"
import UserForm from "@/components/UserForm"
import PatientForm from "@/components/PatientForm"
import DoctorForm from "@/components/DoctorForm"
import CaretakerForm from "@/components/CaretakerForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress" 
import { UserType } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType | null>(null)
  const router = useRouter()

  const handleUserTypeSelection = (type: UserType) => {
    setUserType(type)
  }

  const refreshSession = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error.message);
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Handle form submission or navigation to the next page
      refreshSession()
      router.push(`${userType?.toLocaleLowerCase}`)
    }
  } 


  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Cancer Companion</CardTitle>
          <p className="text-center text-gray-600 mt-2">You are now on the onboarding process</p>
          <Progress value={(step / 3) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <>
              <h2 className="text-xl mb-4">Step 1: User Information</h2>
              <UserForm />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl mb-4">Step 2: User Type Selection</h2>
              {!userType ? (
                <div className="flex flex-col space-y-4">
                  <Button onClick={() => handleUserTypeSelection('PATIENT' as UserType)}>I am a Patient</Button>
                  <Button onClick={() => handleUserTypeSelection('CARETAKER' as UserType)}>I am a Caretaker</Button>
                  <Button onClick={() => handleUserTypeSelection('DOCTOR' as UserType)}>I am a Doctor</Button>
                  <Button variant={'destructive'}onClick={() => handleNext()}>Register as admin</Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg mb-4">{userType} Information</h3>
                  {userType === 'PATIENT' && <PatientForm />}
                  {userType === 'CARETAKER' && <CaretakerForm />}
                  {userType === 'DOCTOR' && <DoctorForm />}
                </>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl mb-4">Step 3: Address Information</h2>
              <AddressForm />
            </>
          )}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="ml-auto">
              {step === 3 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}