'use client'


import JournalForm from "@/components/JournalForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JournalEntry, Patient } from "@/lib/types"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"



export default function JournalPage() {
  const [journals, setJournals] = useState<JournalEntry[] | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null);
  
  const fetchJournals = async () =>{
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('*, User(*)')
      .eq('userId', user?.id)
      .single();
      
    const {data: journalData, error} = await supabase
      .from('JournalEntry')
      .select(`*, 
        Patient(*)
      `)
      .eq("patientId", patientData.id)
      
    setPatient(patientData)
    setJournals(journalData)
  }  


  const handleDelete = async(journal: JournalEntry) => {
    const supabase = createClient();
    const {data: vitalReadings, error: vitalReadingsError} = await supabase
      .from('JournalEntry')
      .delete()
      .eq('id', journal.id)
    await fetchJournals()
  }
  
  useEffect(() => {
    fetchJournals();
  }, [])

  if(!journals) return <div>Loading....</div>
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Journal Entries</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Journal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>  
              <DialogTitle>Input Journal Details</DialogTitle>
            </DialogHeader>
              <JournalForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
      {journals?.map((journal: JournalEntry) => (
        <Card key={journal.id}>
          <CardHeader>
            <CardTitle>{journal.title}</CardTitle>
          </CardHeader>
          <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
              {new Date(journal.createdAt).toDateString()} - <Badge>Mood: {journal.mood}</Badge>
            </p>
            <p>{journal.content}</p>
          </CardContent>
          <CardFooter>
            <Dialog >
              <DialogTrigger asChild>
                <Button variant="secondary">Edit</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>  
                  <DialogTitle>Input Journal Details</DialogTitle>
                </DialogHeader>
                <JournalForm journal={journal}/>
              </DialogContent>
            </Dialog>
            <Button className='mx-3' variant={'destructive'} onClick={() => handleDelete(journal)}>Delete</Button>
          </CardFooter>
        </Card>
        ))}
      </div>
    </div>
  )
}