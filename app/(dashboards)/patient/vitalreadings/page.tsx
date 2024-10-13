'use client'

import JournalForm from '@/components/JournalForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import VitalReadingForm from '@/components/VitalReadingForm'

import { VitalReading,  } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'

const VitalsReadingPage = () => {
  const [readings, setReadings] = useState<VitalReading[] | null>(null)

  const fetchVitalsReading = async () => {
    const supabase = createClient();
    const {data: vitalsReading, error: vitalReadingsError} = await supabase
      .from('VitalReading')
      .select(`*, 
        Vitals(*),
        Patient(*, 
          User(*)),
        RecordedBy: User(*)
      `)
      setReadings(vitalsReading)
  }
  
  const handleDelete = async(vitalReading: VitalReading) => {
    const supabase = createClient();
    const {data, error} = await supabase
      .from('VitalReading')
      .delete()
      .eq('id', vitalReading.id)

    await fetchVitalsReading()
  }

  useEffect(() => {
    fetchVitalsReading()
  },[])

  if(!readings) return <div>Loading....</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Vital Readings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Vital Reading</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>  
              <DialogTitle>Input Vital Reading Details</DialogTitle>
            </DialogHeader>
            <VitalReadingForm />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of your recent vital readings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Recorded For (Patient)</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead>Vital</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading: VitalReading) => (
            <TableRow>
              <TableCell>{reading.id}</TableCell>
              <TableCell>
                {reading.Patient.User.firstName} {reading.Patient.User.middleName} {reading.Patient.User.lastName}
              </TableCell>
              <TableCell>
                {reading.RecordedBy.firstName} {reading.RecordedBy.middleName} {reading.RecordedBy.lastName}
              </TableCell>
              <TableCell>{reading.Vitals.name}</TableCell>
              <TableCell>{reading.value} {reading.Vitals.unitOfMeasure}</TableCell>
              <TableCell>{new Date(reading.createdAt).toDateString()}</TableCell>
              <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant={'outline'}>Edit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>  
                    <DialogTitle>Input Vital Reading Details</DialogTitle>
                  </DialogHeader>
                  <VitalReadingForm vitalReading={reading}/>
                </DialogContent>
              </Dialog>
              <Button variant={'destructive'} className='mt-2' onClick={() => handleDelete(reading)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
    </div>
  )
}

export default VitalsReadingPage