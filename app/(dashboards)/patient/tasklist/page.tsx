'use client'

import { Button } from '@/components/ui/button'
import { Patient } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/dist/server/api-utils'
import React from 'react'

const getPatient = async (): Promise<Patient[] | null> => {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  const {data: Patient, error} = await supabase
  .from('Patient')
  .select('*, User(*) ')
  .eq('userId', user?.id)
  
  if(error){
    console.log(error)
  }
  return Patient

}
const handleCreateTaskList = async () => {
  const supabase = createClient()
  const patient = await getPatient()
  if (patient && patient.length > 0) { 
    const { data: TaskList, error } = await supabase
      .from('TaskList')
      .insert([{ patientId: patient[0].id }]) 
      .select()
    
    if (error) {
      console.error(error)
    }
  }
}
const TaskListPage = () => {
  return (
    <>
      <p>You have no task list.</p>
      <form action={handleCreateTaskList}>
        <Button type='submit'>Generate TaskList</Button>
      </form>
    </>
  )
}

export default TaskListPage